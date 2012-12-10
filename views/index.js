var async = require('async')
var fs = require('fs')
var getFiles = require('../lib/getFiles')
var getResource = require('../lib/asyncResource').get
var getTemplates = getResource(initTemplates)
var getViews = getResource(initViews)
var moment = require('moment')

var thisObj = {
  getTemplates: getTemplates,
  getViews: getViews
}

function initTemplates(callback) {
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

function initViews(callback) {
  getFiles(__dirname, /\.js$/, function(err, files) {
    if (err) return callback(err) 
    var views = {}
    files.forEach(function(file) {
      var start = __dirname.length + 1
      var end = file.length - 3
      views[file.slice(start,end)] = require(file)
    })
  })
}

module.exports = function(res, name) {
  getViews(function(err, views) {
    function render(err, text) {
      if (err) res.end(err.stack)
      res.end(text)
    }
    if (!views[name]) return render(new Error('view not found:' + name))
    var args = Array.prototype.slice.call(arguments).slice(2)
    args.push(render)
    views[name].apply(thisObj, args)
  })
}

module.exports.views = views
