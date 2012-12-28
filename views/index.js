var getResource = require('../lib/asyncResource').get
var server = require('./server')
var client = require('./client')

module.exports = function($) {
  var initializer = $ ? client($) : server()
  var getViews = getResource(initializer.initViews)
  var getTemplates = getResource(initializer.initTemplates)

  var thisObj = {
    getViews: getViews,
    getTemplates: getTemplates
  }

  return function(res, name) {
    var args = Array.prototype.slice.call(arguments).slice(2)
    getViews(function(err, views) {
      function render(err, text) {
        if (err) return res.end(err.stack)
        res.end(text)
      }
      if (!views[name]) return render(new Error('view not found:' + name))
      args.push(render)
      views[name].apply(thisObj, args)
    })
  }
}

