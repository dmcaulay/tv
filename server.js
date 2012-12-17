require('./init')
var ecstatic = require('ecstatic')
var flatiron = require('flatiron')
var app = flatiron.app

app.use(flatiron.plugins.http, {
  before: [
    ecstatic({root: __dirname + '/public'}),
  ]
})

require('./authentication')(app)
require('./router')(app.router)

app.start(8080, function() {
  console.log('started on port 8080')
})

