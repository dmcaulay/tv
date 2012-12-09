
var assert = require('assert')
var views = require('../../views').views

describe('views', function() {
  describe('episodes', function() {
    it('renders an episodes list', function(done) {
      var episodes = [
        {
          show: 'Game of Thrones',
          number: '0101',
          title: 'Pilot',
          date: 'Sat Dec 08 2012 21:29:26'
        }
      ]
      views.episodes(episodes, function(err, content) {
        console.log(content)
        done()
      })
    })
  })
})
