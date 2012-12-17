var db = require('./lib/mongoWrapper').db.add('users')
var passport = require('passport')
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

var validPassword = function(user, password) {
  return true
}

passport.use(new LocalStrategy(function(username, password, done) {
  db.users.findOne({name:username},function(err, user) {
    if (err) return done(err) 
    if (!user) return done(null, false, { message: 'Incorrect username.' })
    if (!validPassword(user, password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, user)
  })
}))

var usersById = {}
passport.serializeUser(function(user, done) {
  var id = user._id.toString()
  usersById[id] = user
  done(null, id);
})

passport.deserializeUser(function(id, done) {
  if (!usersById[id]) return done(new Error('unknown user id:' + id))
  done(null, usersById[id])
})

module.exports = function(app) {
  app.use(flatironPassport)
  app.http.before.push(ensureLoggedIn({safe: ['/signup']}))

  app.router.post('/login', flatironPassport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }))
}
