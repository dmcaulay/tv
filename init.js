
module.exports = function(app) {

  // momentjs
  var moment = require('moment')
  moment.calendar = {
    lastDay : '[Yesterday]',
    sameDay : '[Today]',
    nextDay : '[Tomorrow]',
    lastWeek : '[last] dddd',
    nextWeek : 'dddd',
    sameElse : 'ddd, MMM Do, \'YY'
  };

  moment.fn.fromCalendar = moment.prototype.fromCalendar = function() {
    var diff, calendar, format, comparable;

    comparable = moment().subtract('minutes', 420 - moment().zone()).sod();
    diff = this.diff(comparable, 'days', true);
    calendar = moment.calendar;
    format = diff < -7 ? calendar.sameElse :
      diff < -1 ? '[diff]' :
      diff < 0 ? calendar.lastDay :
      diff < 1 ? calendar.sameDay :
      diff < 2 ? calendar.nextDay :
      diff < 7 ? '[diff]'  : calendar.sameElse;

    // if (this.year() != moment().year()) format = 'M/D/YY'

    if (format === '[diff]') {
      return this.from(comparable);
    } else {
      return this.format(typeof format === 'function' ? format.apply(this) : format);
    }
  }

  // authentication
  require('./authentication').init(app)
}
