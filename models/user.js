var async = require('async')
var db = require('../lib/mongoWrapper').db.add('users')
var episode = require('./episode')

function addShow(user, show, episodes, callback) {
  user.shows.push(show)
  async.parallel([
    function(done) {
      db.users.update({username: user.username}, {$addToSet: {shows: show}}, done)
    },
    function(done) {
      episode.subscribe(user, show, episodes, done)
    }
  ], callback)
}

function removeShow(user, show, callback) {
  user.shows = user.shows.filter(function(s) { return s.showid !== show.showid })
  async.parallel([
    function(done) {
      db.users.update({username: user.username}, {$pull: {shows: show}}, done)
    },
    function(done) {
      episode.unsubscribe(user, show, done)
    }
  ], callback)
}

module.exports = {
  addShow: addShow,
  removeShow: removeShow
}
