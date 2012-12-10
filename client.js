var $ = require('jquery-browserify')
var request = require('./lib/request')
var querystring = require('querystring')

$(document).ready(function() {
  $('.watched').hide()
  $('.episode').click(function(ev) {
    var watched = ev.target.className === 'watched'
    var $episode = (ev.target.className === 'episode') ? $(ev.target) : $(ev.target.parentElement)
    var showid = $episode.data('showid')
    var number = $episode.data('number')
    request({method: 'POST', path:'/watched', json: {showid: showid, number: number, watched: !watched}}, function(err, body) {
      console.log('res', err, body)
    })
    if (watched) {
      $episode.find('.watched').hide()
    } else {
      $episode.find('.watched').show()
    }
  })
})
