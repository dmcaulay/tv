var episode = require('../models/episode')
var moment = require('moment')
var render = require('../views')
var _ = require('underscore')

module.exports = function(router, errorHandler) {
  router.get('/', function(id) {
    var res = this.res
    var user = this.req.user
    episode.unwatched(user, function(err, episodes) {
      if (err) return errorHandler(res, err)
      episodes = _.groupBy(episodes, 'showid')
      user.shows.forEach(function(show) {
        var showEp = episodes[show.showid]
        if (!showEp) return show.remaining = 0
        showEp = _.sortBy(showEp, 'airdate')
        show.remaining = showEp.filter(function(ep) { return moment(ep.airdate).eod() < (new Date()) }).length
        var scheduled = showEp.filter(function(ep) { return moment(ep.airdate).eod() > (new Date()) })
        var next = _.first(scheduled)
        if (next) show.next = next.airdate
      })
      render(res, 'shows', _.sortBy(user.shows, 'name'))
    })
  })

  router.get('/shows/:id', function(id) {
    episode.find(this.req.user, id, function (err, episodes) {
      render(this.res, 'episodes', episodes)
    }.bind(this))
  })

  router.post('/watched', function() {
    episode.watch(this.req.user, this.req.body, function(err) {
      if (err) return errorHandler(this.res, err)
      this.res.end('success')
    }.bind(this))
  })
}

