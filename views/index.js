var async = require('async')
var fs = require('fs')
var getFiles = require('../lib/getFiles')
var getResource = require('../lib/asyncResource').get
var getTemplates = getResource(init)
var moment = require('moment')
var Plates = require('plates')

function init(callback) {
  getFiles(__dirname, /\.html$/, function(err, files) {
    if (err) return callback(err) 
    async.reduce(files, {}, function(templates, file, done) {
      fs.readFile(file, 'utf8', function(err, content) {
        if (err) return done(err)
        var start = __dirname.length + 1
        var end = file.length - 5
        templates[file.slice(start, end)] = content
        done(null, templates)
      })
    }, callback)
  })
}

var views = {
  episodes : function(episodes, callback) {
    getTemplates(function(err, templates) {
      if (err) return callback(err)
      episodes.forEach(function(ep) { ep.date = moment(ep.airdate).fromCalendar().toLowerCase() })
      episodes = Plates.bind(templates['episode'], episodes)
      callback(null, Plates.bind(templates['index'], {content:episodes}))
    })
  },
  shows : function(shows, callback) {
    getTemplates(function(err, templates) {
      if (err) return callback(err)
      shows = Plates.bind(templates['show'], shows)
      callback(null, Plates.bind(templates['index'], {content:shows}))
    })
  }
}

module.exports = function(res, name) {
  function render(err, text) {
    if (err) res.end(err.stack)
    res.end(text)
  }
  if (!views[name]) return render(new Error('view not found:' + name))
  var args = Array.prototype.slice.call(arguments).slice(2)
  args.push(render)
  views[name].apply(null, args)
}

module.exports.views = views
