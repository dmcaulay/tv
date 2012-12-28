var tvrage = require('../external/tvrage')
var user = require('../models/user')
var render = require('../views')
var _ = require('underscore')

module.exports = function(router, errorHandler) {
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
}
