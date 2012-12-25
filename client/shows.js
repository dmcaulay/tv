var $ = require('jquery-browserify')
var request = require('../lib/request')

var $showinfos

var init = function() {
  $showinfos = $('.showinfo')
  $showinfos.each(function() {
    var $show = $(this)
    if ($show.data('editable')) {
      if (!$show.data('subscribed')) $show.find('.subscribed').hide()
    } else {
      if (!$show.data('watched')) $show.find('.subscribed').show()
      $show.find('.plus').hide()
    }
  })
  $showinfos.click(function(ev) {
    var $show = (ev.target.className === 'showinfo') ? $(ev.target) : $(ev.target.parentElement)
    if (!$show.data('editable')) {
      return window.location = $show.find('.showLink').attr('href')
    }
    var subscribed = $show.data('subscribed')
    var showid = $show.data('showid').toString()
    var name = $show.data('name').toString()
    var path = subscribed ? '/unsubscribe' : '/subscribe'
    request({method: 'POST', path: path, json: {showid: showid, name: name}}, function(err, body) {
      console.log('res', err, body)
    })
    if (subscribed) {
      $show.find('.subscribed').hide()
    } else {
      $show.find('.subscribed').show()
    }
    $show.data('subscribed', !subscribed)
  })
}

module.exports = {
  init: init
}
