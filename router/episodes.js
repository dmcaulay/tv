
var db = require('../lib/mongoWrapper').db.add('episodes')
var episode = require('../models/episode')
var render = require('../views')
var _ = require('underscore')

module.exports = function(router, errorHandler) {
  router.post('/watched', function() {
    episode.watch(this.req.user, this.req.body, function(err) {
      if (err) return errorHandler(this.res, err)
      this.res.end('success')
    }.bind(this))
  })
}

