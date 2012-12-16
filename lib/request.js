var http = require('http')

var request = module.exports = function(options,callback) {
  options.port = options.port || 80 
  options.hostname = options.hostname || 'tvtrack.jit.su'
  var req = http.request(options, function(res) {
    if (res.setEncoding) res.setEncoding('utf8')
    var body = ''
    res.on('data', function(data) {
      body += data
    })
    res.on('end', function() {
      callback(null, body)
    })
  })
  req.on('error', function(err) {
    callback(err)
  })
  if (options.json) {
    req.setHeader('accept', 'application/json')
    req.setHeader('content-type', 'application/json')
    req.write(JSON.stringify(options.json))
  }
  req.end()
}

