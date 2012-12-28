var $ = require('jquery-browserify')
var request = require('../lib/request')

var $dialog
var $links

var init = function() {
  $dialog = $('#dialog')
  $inner = $('#inner')
  $links = $('.create-event')
  $links.click(function(ev) {
    $dialog.show()
  })
  $inner.click(function(ev) {
    if (ev.target.type === 'submit') return
    ev.stopPropagation()
  })
  $dialog.click(function(ev) {
    $dialog.hide()
  })
}

module.exports = {
  init: init
}
