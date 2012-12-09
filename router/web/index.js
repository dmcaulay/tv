
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
        api.handle({cmd: 'episodeList', args: [showId]}, {list: true}, done)
      }, function(err, results) {
        var episodes = _.flatten(results)
        episodes = episodes.filter(function(ep) { return ep.airdate > (new Date()) })
        episodes = _.sortBy(episodes, 'airdate')
        render(res, 'episodes', episodes)
      })
    })
  })
}

