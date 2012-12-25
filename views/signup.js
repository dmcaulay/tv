
var plates = require('plates')

module.exports = function(callback) {
  this.getTemplates(function(err, templates) {
    if (err) return callback(err)
    var map = new plates.Map()
    map.class('nav').use('nav')
    map.class('navLink').use('navLink').as('href')
    map.class('content').use('content')
    callback(null, plates.bind(templates['index'], {content:templates['signup'], nav: 'login', navLink: '/login'}, map))
  })
}
