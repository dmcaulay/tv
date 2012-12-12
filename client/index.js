var $ = require('jquery-browserify')
var episodes = require('./episodes')
var shows = require('./shows')

$(document).ready(function() {
  episodes.init()
  shows.init()
})
