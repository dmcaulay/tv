var readline = require('readline')
var request = require('request')
var xml2js = require('xml2js')

var router = require('./router')

var parser = new xml2js.Parser()
var last

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var isLink = function(cmd) {
  return last && !isNaN(parseInt(cmd))
}

var getLink = function(cmd, args) {
  var link = isLink(cmd) && last.cmd
  return {
    cmd:  link || cmd,
    args: (link && last.args[cmd]) || args
  }
}

rl.on('line', function (cmd) {
  var input = cmd.split(' ')
  var route = getLink(input[0], input.slice(1))
  if (!router[route.cmd]) return console.log('unknown cmd', cmd)
  var url = router[route.cmd].url.apply(null, route.args)
  request({url:url,timeout:20000}, function(err, res, body) {
    if (err) return console.log('err', err)
    parser.parseString(body, function(err, json) {
      if (err) return console.log('err', err)
      last = router[route.cmd].render(json)
    })
  })
});
