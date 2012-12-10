
var async = require('async')
var db = require('../lib/mongoWrapper').db.add('users')
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
      async.map(user.shows, function(showid, done) {
        async.parallel({
          info: tvrage.showinfo.bind(null, showid),
          episodes: tvrage.episodeList.bind(null, showid)
        }, done)
      }, function(err, results) {
        if (err) return handleError(res, err)
        var infos = results.reduce(function(infos, res) { 
          infos[res.info.name] = res.info 
          return infos
        }, {})
        var episodes = results.map(function(res) { return res.episodes } )
        episodes = _.flatten(episodes)
        episodes = episodes.filter(function(ep) { return ep.airdate > (new Date()) })
        episodes = _.sortBy(episodes, 'airdate')
        episodes.forEach(function(ep) {
          ep.network = infos[ep.show].network
          ep.showid = infos[ep.show].showid
        })
        render(res, 'episodes', episodes)
      })
    })
  })

  router.get('/shows/:id', function(id) {
    var res = this.res
    async.parallel({
      info: tvrage.showinfo.bind(null, id),
      episodes: tvrage.episodeList.bind(null, id)
    }, function(err, result) {
      if (err) return handleError(res, err)
      result.episodes.forEach(function(ep) {
        ep.network = result.info.network
        ep.showid = result.info.showid
      })
      render(res, 'episodes', result.episodes)
    })
  })

  router.post('/watched', function() {
    this.res.end('watched')
    console.log(this.req.body)
  })

  router.post('/search', function() {
    tvrage.search(this.req.body.term, function(err, shows) {
      if (err) return handleError(res, err)
      render(this.res, 'shows', shows)
    }.bind(this))
  })
}

