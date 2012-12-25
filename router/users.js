var auth = require('../authentication')
var db = require('../lib/mongoWrapper').db.add('users')
var passwordHash = require('password-hash')
var render = require('../views')

module.exports = function(router, errorHandler) {
  router.get('/login', function() {
    render(this.res, 'login')
  })
  router.post('/login', auth.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  }))
  router.get('/logout', function() {
    this.req.logout()
    this.res.redirect('/login')
  })

  router.get('/signup', function() {
    render(this.res, 'signup')
  })

  router.post('/signup', function() {
    var body = this.req.body
    if (body.password !== body.confirm) {
      return render(this.res, 'signup', {err: 'password and password confirm do not match'})
    }
    var user = { username: body.username, password: passwordHash.generate(body.password), shows: [] }
    db.users.insert(user, function(err, users) {
      if (err) return errorHandler(this.res, err)
      this.req.login(users, function(err) {
        if (err) return errorHandler(this.res, err)
        this.res.redirect('/')
      }.bind(this))
    }.bind(this))
  })
}
