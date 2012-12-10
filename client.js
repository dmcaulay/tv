var $ = require('jquery-browserify')
var request = require('./lib/request')
var querystring = require('querystring')

$(document).ready(function() {
  // episode
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

  // show
  $('.show').click(function(ev) {
    var added = ev.target.className === 'added'
    var $show = (ev.target.className === 'show') ? $(ev.target) : $(ev.target.parentElement)
    var showid = $episode.data('showid')
    var path = added ? '/remove' : '/add'
    request({method: 'POST', path: path, json: {showid: showid}, function(err, body) {
      console.log('res', err, body)
    })
    if (added) {
      $show.find('.added').hide()
    } else {
      $show.find('.added').show()
    }
  })
})
