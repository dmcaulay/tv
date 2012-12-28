var plates = require('plates')
var moment = require('moment')
var util = require('util')

module.exports = function(shows, callback) {
  this.getTemplates(function(err, templates) {
    if (err) return callback(err)
    shows.forEach(function(show) { 
      show.showLink = '/shows/' + show.showid
      if (util.isDate(show.next)) {
        show.next = moment(show.next).fromCalendar().toLowerCase()
      } else {
        show.next = 'not scheduled'
      }
    })
    var map = new plates.Map()
    map.class('showinfo').use('showid').as('data-showid')
    map.class('showinfo').use('name').as('data-name')
    map.class('showinfo').use('subscribed').as('data-subscribed')
    map.class('showinfo').use('watched').as('data-watched')
    map.class('showinfo').use('editable').as('data-editable')
    map.class('showLink').use('showLink').as('href')
    map.class('name').use('name')
    map.class('next').use('next')
    map.class('remaining').use('remaining')
    shows = templates['shows'] + plates.bind(templates['show'], shows, map)
    map = new plates.Map()
    map.class('nav').use('nav')
    map.class('navLink').use('navLink').as('href')
    map.class('content').use('content')
    callback(null, plates.bind(templates['index'], {content:shows, nav: 'logout', navLink: '/logout'}, map))
  })
}
