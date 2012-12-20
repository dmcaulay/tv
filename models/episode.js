var async = require('async')
var db = require('../lib/mongoWrapper').db.add('episodes')
var _ = require('underscore')

function subscribe(user, show, episodes, callback) {
  async.forEach(episodes, function(ep, done) {
    ep.user = user.username
    ep.subscribed = true
    ep.watched = false
    db.episodes.update({user: user.username, showid: show.showid, number: ep.number}, {$set: ep}, {upsert: true, 'new': true}, done)
  }, callback)
}

function unsubscribe(user, show, callback) {
  db.episodes.update({user: user.username, showid: show.showid}, {$set: {subscribed: false}}, {multi: true}, callback)
}

function watch(user, episode, callback) {
  db.episodes.update({user: user.username, showid: episode.showid, number: episode.number}, {$set: episode}, callback)
}

function find(user, showid, callback) {
  db.episodes.find({user: user.username, showid: showid}, function(err, cursor) {
    if (err) return callback(err)
    cursor.toArray(function(err, episodes) {
      if (err) return callback(err)
      callback(null, _.sortBy(episodes, 'airdate'))
    })
  })
}

module.exports = {
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  watch: watch,
  find: find
}
