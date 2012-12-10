var $ = require('jquery-browserify')
var request = require('./lib/request')
var querystring = require('querystring')

$(document).ready(function() {
  // episode
  $('.episode').each(function() {
    var $episode = $(this)
    var watched = $episode.data('watched')
    if (!watched) $episode.find('.watched').hide()
  })
  $('.episode').click(function(ev) {
    var watched = ev.target.className === 'watched'
    var $episode = (ev.target.className === 'episode') ? $(ev.target) : $(ev.target.parentElement)
    var showid = $episode.data('showid').toString()
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
  $('.showinfo').each(function() {
    var $show = $(this)
    var subscribed = $show.data('subscribed')
    if (!subscribed) $show.find('.subscribed').hide()
  })
  $('.showinfo').click(function(ev) {
    var subscribed = ev.target.className === 'subscribed'
    var $show = (ev.target.className === 'showinfo') ? $(ev.target) : $(ev.target.parentElement)
    var showid = $show.data('showid').toString()
    var path = subscribed ? '/unsubscribe' : '/subscribe'
    request({method: 'POST', path: path, json: {showid: showid}}, function(err, body) {
      console.log('res', err, body)
    })
    if (subscribed) {
      $show.find('.subscribed').hide()
    } else {
      $show.find('.subscribed').show()
    }
  })
})
