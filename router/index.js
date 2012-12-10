
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

function handleError(res, err) {
  res.end(err.stack)
}

module.exports = function(router) {
  router.get('/', function() {
    var res = this.res
    getUser(function(err, user) {
      if (err) return handleError(res, err)
      async.map(user.shows, tvrage.episodes, function(err, episodes) {
        if (err) return handleError(res, err)
        episodes = _.flatten(episodes)
        episodes = episodes.filter(function(ep) { return ep.airdate > (new Date()) })
        episodes = _.sortBy(episodes, 'airdate')
        render(res, 'episodes', episodes)
      })
    })
  })

  router.post('/watched', function() {
    this.res.end('watched')
    console.log(this.req.body)
  })

  router.get('/shows/:id', function(id) {
    var res = this.res
    tvrage.episodes(id, function(err, episodes) {
      render(res, 'episodes', episodes)
    })
  })

  router.post('/add', function() {
    this.res.end('add')
    console.log(this.req.body)
  })

  router.post('/remove', function() {
    this.res.end('remove')
    console.log(this.req.body)
  })

  router.post('/search', function() {
    tvrage.search(this.req.body.term, function(err, shows) {
      if (err) return handleError(res, err)
      render(this.res, 'shows', shows)
    }.bind(this))
  })
}

