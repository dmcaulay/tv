var async = require('async')
var db = require('../lib/mongoWrapper').db.add('episodes')
var tvrage = require('../external/tvrage')
var user = require('../models/user')
var episode = require('../models/episode')
var render = require('../views')
var _ = require('underscore')

module.exports = function(router, errorHandler) {
  router.get('/', function(id) {
    var res = this.res
    var user = this.req.user
    db.episodes.find({user: user.username, subscribed: true, watched: false}, function(err, cursor) {
      if (err) return errorHandler(res, err)
      cursor.toArray(function(err, episodes) {
        if (err) return errorHandler(res, err)
        episodes = _.groupBy(episodes, 'showid')
        user.shows.forEach(function(show) {
          var showid = show.showid
          if (!episodes[showid]) return show.watched = true
          var showEp = episodes[showid]
          show.length = showEp.length
          show.date = _.first(_.sortBy(showEp, 'airdate')).airdate
        })
        render(res, 'shows', user.shows)
      })
    })
  })

  router.get('/shows/:id', function(id) {
    episode.find(this.req.user, id, function (err, episodes) {
      render(this.res, 'episodes', episodes)
    }.bind(this))
  })

  router.post('/subscribe', function() {
    var show = this.req.body
    var res = this.res
    tvrage.episodes(show.showid, function(err, episodes) {
      if (err) return errorHandler(res, err)
      user.addShow(this.req.user, show, episodes, function(err) {
        if (err) return errorHandler(res, err)
        res.end('success')
      })
    }.bind(this))
  })

  router.post('/unsubscribe', function() {
    user.removeShow(this.req.user, this.req.body, function(err) {
      if (err) return errorHandler(res, err)
      this.res.end('success')
    }.bind(this))
  })

  router.post('/search', function() {
    var user = this.req.user
    tvrage.search(this.req.body.term, function(err, shows) {
      if (err) return errorHandler(this.res, err)
      shows.forEach(function(show) { 
        show.subscribed = _.some(user.shows, function(s) { return s.showid === show.showid }) 
        show.editable = true
      })
      render(this.res, 'shows', shows)
    }.bind(this))
  })
}
