
var api = require('../../router')
var async = require('async')
var db = require('../../lib/mongoWrapper').db.add('users')
var render = require('../../views')
var _ = require('underscore')

module.exports = function(router) {
  router.get('/', function() {
    var res = this.res
    db.users.findOne({name: 'dan'}, function(err, user) {
      async.map(user.shows, function(showId, done) {
        async.series({
          list: api.handle.bind(null, {cmd: 'episodeList', args: [showId]}, {list: true}),
          info: api.handle.bind(null, {cmd: 'showInfo', args: [showId]}, {list: true})
        }, done)
      }, function(err, results) {
        var infos = results.reduce(function(infos, res) { 
          infos[res.info.name] = res.info 
          return infos
        }, {})
        var episodes = results.map(function(res) { return res.list } )
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
    async.series({
      list: api.handle.bind(null, {cmd: 'episodeList', args: [id]}, {list: true}),
      info: api.handle.bind(null, {cmd: 'showInfo', args: [id]}, {list: true})
    }, function(err, result) {
      result.list.forEach(function(ep) {
        ep.network = result.info.network
        ep.showid = result.info.showid
      })
      render(res, 'episodes', result.list)
    })
  })

  router.post('/search', function() {
    api.handle({cmd: 'search', args: [this.req.body.term]}, {list: true}, function(err, shows) {
      render(this.res, 'shows', shows)
    }.bind(this))
  })
}

