var $ = require('jquery-browserify')
var request = require('./lib/request')
var querystring = require('querystring')

var lastEpisode
var $episodes
var $showinfos

var getEpisodesBetween = function($ep1, $ep2) {
  var i1 = $episodes.index($ep1)
  var i2 = $episodes.index($ep2)
  var min = Math.min(i1, i2)
  var max = Math.max(i1, i2)
  var $selected = []
  $episodes.each(function(i, episode) {
    if (i >= min && i <= max) $selected.push($(episode))
  })
  return $selected
}

$(document).ready(function() {
  // episode
  $episodes = $('.episode')
  $episodes.each(function() {
    var $episode = $(this)
    var watched = $episode.data('watched')
    if (!watched) $episode.find('.watched').hide()
  })
  $episodes.click(function(ev) {
    var watched = ev.target.className === 'watched'
    var $episode = (ev.target.className === 'episode') ? $(ev.target) : $(ev.target.parentElement)
    var $selected = ev.shiftKey && lastEpisode ? getEpisodesBetween($episode, lastEpisode.$episode) : [$episode]
    if ($selected.length !== 1) watched = lastEpisode.watched
    $selected.forEach(function($episode) {
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
    lastEpisode = {watched: watched, $episode: $episode}
  })

  // show
  $showinfos = $('.showinfo')
  $showinfos.each(function() {
    var $show = $(this)
    var subscribed = $show.data('subscribed')
    if (!subscribed) $show.find('.subscribed').hide()
  })
  $showinfos.click(function(ev) {
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
