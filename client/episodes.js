var $ = require('jquery-browserify')
var request = require('../lib/request')

var lastEpisode
var $episodes

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

var init = function() {
  $episodes = $('.episode')
  $episodes.each(function() {
    var $episode = $(this)
    if (!$episode.data('watched')) $episode.find('.watched').hide()
  })
  $episodes.click(function(ev) {
    var $episode = (ev.target.className === 'episode') ? $(ev.target) : $(ev.target.parentElement)
    var watched = $episode.data('watched')
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
      $episode.data('watched', !watched)
    })
    lastEpisode = {watched: watched, $episode: $episode}
  })
}

module.exports = {
  init: init
}
