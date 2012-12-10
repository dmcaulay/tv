
var moment = require('moment')
var plates = require('plates')

module.exports = function(episodes, callback) {
  this.getTemplates(function(err, templates) {
    if (err) return callback(err)
    episodes.forEach(function(ep) { 
      ep.date = moment(ep.airdate).fromCalendar().toLowerCase()
      ep.showLink = '/shows/' + ep.showid
    })
    var map = new plates.Map()
    map.class('episode').use('showid').as('data-showid')
    map.class('episode').use('number').as('data-number')
    map.class('showLink').use('showLink').as('href')
    map.class('show').use('show')
    map.class('number').use('number')
    map.class('title').use('title')
    map.class('network').use('network')
    map.class('date').use('date')
    episodes = plates.bind(templates['episode'], episodes, map)
    callback(null, plates.bind(templates['index'], {content:episodes}))
  })
}
