var readline = require('readline')
var router = require('./router')
var last

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var isLink = function(cmd) {
  return last && !isNaN(parseInt(cmd))
}

var getRoute = function(cmd, args) {
  var link = isLink(cmd) && last.cmd
  return {
    cmd:  link || cmd,
    args: (link && last.args[cmd]) || args
  }
}

rl.on('line', function (cmd) {
  var input = cmd.split(' ')
  var route = getRoute(input[0], input.slice(1))
  router.handle(route, function(err, next) {
    last = next
  })
});
