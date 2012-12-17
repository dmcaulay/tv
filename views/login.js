
var plates = require('plates')

module.exports = function(callback) {
  this.getTemplates(function(err, templates) {
    if (err) return callback(err)
    callback(null, plates.bind(templates['index'], {content:templates['login']}))
  })
}
