var plates = require('plates')

module.exports = function(shows, callback) {
  this.getTemplates(function(err, templates) {
    if (err) return callback(err)
    shows.forEach(function(show) { 
      show.showLink = '/shows/' + show.showid
    })
    var map = new plates.Map()
    map.class('showLink').use('showLink').as('href')
    map.class('name').use('name')
    shows = plates.bind(templates['show'], shows, map)
    callback(null, plates.bind(templates['index'], {content:shows}))
  })
}
