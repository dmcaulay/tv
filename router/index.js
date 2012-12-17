
var async = require('async')
var db = require('../lib/mongoWrapper').db.add('users').add('episodes')
var getUser = require('../lib/asyncResource').get(initUser)
var moment = require('moment')
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

function addShow(user, show) {
  user.shows.push(show)
  db.users.update({name: user.name}, {$addToSet: {shows: show}}, function(err) {
    if (err) console.log('err',err)
  })
}

function removeShow(user, show) {
  user.shows = user.shows.filter(function(s) { return s.showid !== show.showid })
  db.users.update({name: user.name}, {$pull: {shows: show}}, function(err) {
    if (err) console.log('err',err)
  })
}

function handleError(res, err) {
  res.end(err.stack)
}

module.exports = function(router) {
  router.get('/login', function() {
    render(this.res, 'login')
  })

  router.get('/signup', function() {
    render(this.res, 'signup')
  })

  router.post('/signup', function() {
    render(this.res, 'signup')
  })

  var newEpisodes = function() {
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      db.episodes.find({user: user.name, subscribed: true}, function(err, cursor) {
        if (err) return handleError(res, err)
        cursor.toArray(function(err, episodes) {
          if (err) return handleError(res, err)
          episodes = episodes.filter(function(ep) { return moment(ep.airdate).eod() > (new Date()) })
          episodes = _.sortBy(episodes, 'airdate')
          render(res, 'episodes', episodes)
        })
      })
    })
  }
  router.get('/', newEpisodes)
  router.get('/new', newEpisodes)

  router.get('/all', function() {
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      db.episodes.find({user: user.name, subscribed: true, watched: false}, function(err, cursor) {
        if (err) return handleError(res, err)
        cursor.toArray(function(err, episodes) {
          if (err) return handleError(res, err)
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

  router.get('/shows', function(id) {
    getUser(function(err, user) {
      user.shows.forEach(function(s) { s.editable = false })
      render(this.res, 'shows', user.shows)
    }.bind(this))
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
    var show = this.req.body
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      tvrage.episodes(show.showid, function(err, episodes) {
        if (err) return handleError(res, err)
        addShow(user, show)
        async.forEach(episodes, function(ep, done) {
          ep.user = user.name
          ep.subscribed = true
          ep.watched = false
          db.episodes.update({user: user.name, showid: show.showid, number: ep.number}, {$set: ep}, {upsert: true, 'new': true}, done)
        }, function(err) {
          if (err) return handleError(res, err)
          res.end('success')
        })
      })
    })
  })

  router.post('/unsubscribe', function() {
    var show = this.req.body
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      removeShow(user, show)
      db.episodes.update({user: user.name, showid: show.showid}, {$set: {subscribed: false}}, {multi: true}, function(err) {
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
        shows.forEach(function(show) { 
          show.subscribed = _.some(user.shows, function(s) { return s.showid === show.showid }) 
          show.editable = true
        })
        render(this.res, 'shows', shows)
      }.bind(this))
    }.bind(this))
  })
}

