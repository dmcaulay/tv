
var async = require('async')
var db = require('../lib/mongoWrapper').db.add('users').add('episodes')
var getUser = require('../lib/asyncResource').get(initUser)
var render = require('../views')
var tvrage = require('../external/tvrage')
var _ = require('underscore')

function initUser(callback) {
  var name = 'dan'
  db.users.findOne({name: name}, function(err, user) {
    if (err) return callback(err)
    if (user) return callback(null, user) 
    var newUser = {name: name, shows: []}
    db.users.save(newUser, function(err) {
      if (err) return callback(err)
      callback(null, newUser)
    })
  })
}

function addShow(user, showid) {
  user.shows.push(showid)
  db.users.update({name: user.name}, {$addToSet: {shows: showid}}, function(err) {
    if (err) console.log('err',err)
  })
}

function removeShow(user, showid) {
  if (~user.shows.indexOf(showid)) user.shows.splice(user.shows.indexOf(showid), 1)
  db.users.update({name: user.name}, {$pull: {shows: showid}}, function(err) {
    if (err) console.log('err',err)
  })
}

function handleError(res, err) {
  res.end(err.stack)
}

module.exports = function(router) {
  router.get('/', function() {
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      db.episodes.find({user: user.name, subscribed: true}, function(err, cursor) {
        if (err) return handleError(res, err)
        cursor.toArray(function(err, episodes) {
          if (err) return handleError(res, err)
          episodes = episodes.filter(function(ep) { return ep.airdate > (new Date()) })
          episodes = _.sortBy(episodes, 'airdate')
          render(res, 'episodes', episodes)
        })
      })
    })
  })

  router.post('/watched', function() {
    var body = this.req.body
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      db.episodes.update({user: user.name, showid: body.showid, number: body.number}, {$set: body}, function(err) {
        if (err) return handleError(res, err)
        res.end('success')
      })
    })
  })

  router.get('/shows/:id', function(id) {
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      db.episodes.find({user: user.name, showid: id}, function(err, cursor) {
        if (err) return handleError(res, err)
        cursor.toArray(function(err, episodes) {
          if (err) return handleError(res, err)
          episodes = _.sortBy(episodes, 'airdate')
          render(res, 'episodes', episodes)
        })
      })
    })
  })

  router.post('/subscribe', function() {
    var showid = this.req.body.showid
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      tvrage.episodes(showid, function(err, episodes) {
        if (err) return handleError(res, err)
        addShow(user, showid)
        async.forEach(episodes, function(ep, done) {
          ep.user = user.name
          ep.subscribed = true
          db.episodes.update({user: user.name, showid: showid, number: ep.number}, {$set: ep}, {upsert: true, 'new': true}, done)
        }, function(err) {
          if (err) return handleError(res, err)
          res.end('success')
        })
      })
    })
  })

  router.post('/unsubscribe', function() {
    var showid = this.req.body.showid
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      removeShow(user, showid)
      db.episodes.update({user: user.name, showid: showid}, {$set: {subscribed: false}}, {multi: true}, function(err) {
        if (err) return handleError(res, err)
        res.end('success')
      })
    })
  })

  router.post('/search', function() {
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      tvrage.search(this.req.body.term, function(err, shows) {
        if (err) return handleError(this.res, err)
        shows.forEach(function(show) { show.subscribed = !!~user.shows.indexOf(show.showid) })
        render(this.res, 'shows', shows)
      }.bind(this))
    }.bind(this))
  })
}

