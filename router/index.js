
function errorHandler(res, err) {
  res.end(err.stack)
}

module.exports = function(router) {
  require('./users')(router, errorHandler)
  require('./episodes')(router, errorHandler)
  require('./shows')(router, errorHandler)
}

