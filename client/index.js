var $ = require('jquery-browserify')
var avocado = require('./avocado')
var episodes = require('./episodes')
var shows = require('./shows')

$(document).ready(function() {
  avocado.init()
  episodes.init()
  shows.init()
})
