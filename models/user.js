var async = require('async')
var db = require('../lib/mongoWrapper').db.add('users')
var episode = require('./episode')
var moment = require('moment')
var tvrage = require('../external/tvrage')

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

function updateEpisodes(user) {
  if (!user.shows || !user.shows.length) return
  if (user.lastUpdated && (moment(user.lastUpdated) > moment().subtract('days',1))) return
  async.forEach(user.shows, function(show, done) {
    tvrage.episodes(show.showid, function(err, episodes) {
      if (err) return done(err)
      episode.update(user, show, episodes, done)
    })
  }, function(err) {
    if (err) console.log('error updating',user.username,'shows',err)
    db.users.update({username: user.username}, {$set: {lastUpdated: new Date()}}, function(err) {
      if (err) console.log('error saving lastUpdated',user.username,err)
    })
  })
}

module.exports = {
  addShow: addShow,
  removeShow: removeShow,
  updateEpisodes: updateEpisodes
}
