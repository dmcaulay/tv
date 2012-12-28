
module.exports = function($) {
  function init(selector) {
    var map = {}
    $collection = $(selector)
    $collection.each(function() {
      var $el = $(this)
      map[$el.data('name')] = $el.html()
    })
    callback(null, map)
  }

  return {
    initViews: init('.view'),
    initTemplates: init('.template')
  }
}
