var plates = require('plates')
var moment = require('moment')

module.exports = function(shows, callback) {
  this.getTemplates(function(err, templates) {
    if (err) return callback(err)
    shows.forEach(function(show) { 
      show.showLink = '/shows/' + show.showid
      show.date = moment(show.date).fromCalendar().toLowerCase()
    })
    var map = new plates.Map()
    map.class('showinfo').use('showid').as('data-showid')
    map.class('showinfo').use('name').as('data-name')
    map.class('showinfo').use('subscribed').as('data-subscribed')
    map.class('showinfo').use('watched').as('data-watched')
    map.class('showinfo').use('editable').as('data-editable')
    map.class('showLink').use('showLink').as('href')
    map.class('name').use('name')
    map.class('date').use('date')
    map.class('length').use('length')
    shows = plates.bind(templates['show'], shows, map)
    map = new plates.Map()
    map.class('nav').use('nav')
    map.class('navLink').use('navLink').as('href')
    map.class('content').use('content')
    callback(null, plates.bind(templates['index'], {content:shows, nav: 'logout', navLink: '/logout'}, map))
  })
}
