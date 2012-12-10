var request = require('request')
var xml2js = require('xml2js')

var parser = new xml2js.Parser()

module.exports = function(baseUrl) {
  var cache = {}
  return function(path, callbac) {
    var url = baseUrl + path
    function done(json) {
      cache[url] = json
      callback && callback(null, json)
    }
    if (cache[url]) return done(cache[url])
    request({url:url,timeout:20000}, function(err, res, body) {
      if (err) return console.log('err', err)
      parser.parseString(body, function(err, json) {
        if (err) return console.log('err', err)
        done(json)
      })
    })
  }
}


