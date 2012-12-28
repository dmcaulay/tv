var async = require('async')
var fs = require('fs')
var getFiles = require('../lib/getFiles')

function initViews(callback) {
  getFiles(__dirname, /\.js$/, function(err, files) {
    if (err) return callback(err) 
    var views = {}
    files.forEach(function(file) {
      var start = __dirname.length + 1
      var end = file.length - 3
      views[file.slice(start,end)] = require(file)
    })
    callback(null, views)
  })
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

module.exports = function() {
  return {
    initViews: initViews,
    initTemplates: initTemplates
  }
}
