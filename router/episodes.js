
var db = require('../lib/mongoWrapper').db.add('episodes')
var episode = require('../models/episode')
var moment = require('moment')
var render = require('../views')
var _ = require('underscore')

module.exports = function(router, errorHandler) {
  var newEpisodes = function() {
    var res = this.res
    db.episodes.find({user: this.req.user.username, subscribed: true}, function(err, cursor) {
      if (err) return errorHandler(res, err)
      cursor.toArray(function(err, episodes) {
        if (err) return errorHandler(res, err)
        episodes = episodes.filter(function(ep) { return moment(ep.airdate).eod() > (new Date()) })
        episodes = _.sortBy(episodes, 'airdate')
        render(res, 'episodes', episodes)
      })
    })
  }
  router.get('/', newEpisodes)
  router.get('/new', newEpisodes)

  router.get('/all', function() {
    var res = this.res
    db.episodes.find({user: this.req.user.username, subscribed: true, watched: false}, function(err, cursor) {
      if (err) return errorHandler(res, err)
      cursor.toArray(function(err, episodes) {
        if (err) return errorHandler(res, err)
        episodes = _.sortBy(episodes, 'airdate')
        render(res, 'episodes', episodes)
      })
    })
  })

  router.post('/watched', function() {
    episode.watch(this.req.user, this.req.body, function(err) {
      if (err) return errorHandler(this.res, err)
      this.res.end('success')
    }.bind(this))
  })
}

