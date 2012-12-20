var db = require('./lib/mongoWrapper').db.add('users')
var passport = require('passport')
var passwordHash = require('password-hash')
var flatironPassport = require('flatiron-passport')
var LocalStrategy = require('passport-local').Strategy

var ensureLoggedIn = module.exports = function(options) {
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }
  options = options || {};
  
  var url = options.redirectTo || '/login';
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
  var safe = options.safe || []
  safe.push(url)
  
  return function(req, res) {
    if (~safe.indexOf(req.url)) return res.emit('next')
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.url;
      }
      return res.redirect(url);
    }
    res.emit('next');
  }
}

passport.use(new LocalStrategy(function(username, password, done) {
  db.users.findOne({username:username},function(err, user) {
    if (err) return done(err) 
    if (!user) return done(null, false, { message: 'Incorrect username.' })
    if (!passwordHash.verify(password, user.password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, user)
  })
}))

var users = {}
passport.serializeUser(function(user, done) {
  users[user.username] = user
  done(null, user.username);
})

passport.deserializeUser(function(id, done) {
  if (!users[id]) return done(new Error('unknown user id:' + id))
  done(null, users[id])
})

module.exports = {
  init: function(app) {
    app.use(flatironPassport)
    app.http.before.push(ensureLoggedIn({safe: ['/signup']}))
  },
  authenticate: flatironPassport.authenticate
}
