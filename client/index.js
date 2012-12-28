var $ = require('jquery-browserify')
var avocado = require('./avocado')
var episodes = require('./episodes')
var createRenderer = require('../views')
var shows = require('./shows')

$(document).ready(function() {
  render = createRenderer($)
  avocado.init(render)
  episodes.init(render)
  shows.init(render)
})
