
var async = require('async')
var moment = require('moment')
var request = require('request')
var routes = require('./routes')
var db = require('../lib/mongoWrapper').db.add('users')
var xml2js = require('xml2js')
var _ = require('underscore')

var cache = {}
var currentUser
var parser = new xml2js.Parser()

var render = function(cmd, json) {
  return routes[cmd].render(json)
}

var list = function(cmd, json) {
  return routes[cmd].list(json)
}

var renderShows = function() {
  if (currentUser.shows.length) {
    console.log('shows')
    async.map(currentUser.shows, function(showId, done) {
      router.handle({cmd: 'episodeList', args: [showId]}, {list: true}, done)
    }, function(err, results) {
      episodes = _.flatten(results)
      episodes = _.sortBy(episodes, 'airdate').reverse()
      episodes.forEach(function(ep) {
        console.log(ep.show + ' - ' + ep.number + ' - ' + ep.title + ' - ' + moment(ep.airdate).fromNow())
      })
    })
  }
}

var login = function(name) {
  return db.users.findOne({name: name}, function(err, user) {
    function handleLogin(user) {
      console.log('welcome ' + user.name)
      currentUser = user
      renderShows()
    }
    if (err) return console.log('db err', err)
    if (user) return handleLogin(user) 
    var newUser = {name: name, shows: []}
    db.users.save(newUser, function(err) {
      if (err) return console.log('db err', err)
      handleLogin(newUser)
    })
  })
}

var save = function(showId) {
  if (!currentUser) return console.log('save err: not logged in')
  if (~currentUser.shows.indexOf(showId)) return console.log('save err: already watching that show')
  currentUser.shows.push(showId)
  db.users.save(currentUser, function(err) {
    if (err) return console.log('db err', err)
  })
}

var router = module.exports = {
  handle: function(route, options, callback) {
    function done(json) {
      cache[url] = json
      var result = options.list ? list(route.cmd, json) : render(route.cmd, json)
      callback && callback(null, result)
    }
    if (!callback) {
      callback = options
      options = {}
    }
    if (route.cmd === 'login') return login(route.args[0])
    if (route.cmd === 'save') return save(route.args[0])
    if (!routes[route.cmd]) return console.log('unknown cmd', route.cmd)
    var url = routes[route.cmd].url.apply(null, route.args)
    if (cache[url]) return done(cache[url])
    request({url:url,timeout:20000}, function(err, res, body) {
      if (err) return console.log('err', err)
      parser.parseString(body, function(err, json) {
        if (err) return console.log('err', err)
        done(json)
      })
    })
  }
}

