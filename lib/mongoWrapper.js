
var config = require('config'),
    mongo = require('mongodb'),
    Server = mongo.Server,
    Db = mongo.Db,
    ReadPreference = mongo.ReadPreference,
    collectionMethods = Object.keys(require('mongodb').Collection.prototype),
    getResource = require('./asyncResource').get,
    _ = require('underscore');

function CollectionWrapper(name, getConnectedDb) {
  function mongoCollection(callback) {
    getConnectedDb(function(err, db) {
      if (err) return callback(err);
      db.collection(name, {readPreference:'secondary'}, callback);
    });
  }

  this.get = getResource(mongoCollection);
}

collectionMethods.forEach(function(method) {
  CollectionWrapper.prototype[method] = function() {
    var callback = _.last(arguments);
    var args = arguments;
    this.get(function(err, collection) {
      if (err) return callback(err);
      collection[method].apply(collection, args);
    });
  };
});

function DbWrapper(config) {
  var server = new Server(config.host, config.port, {auto_reconnect: true});
  var db = new Db(config.name, server, {safe: true});

  this.getConnectedDb = getResource(function(callback) {
    db.open(function(err) {
      if (err) return callback(err);
      if (!config.user) return callback(null, db);
      db.authenticate(config.user, config.pass, function(err, authenticated) {
        if (err) return callback(err);
        if (!authenticated) return callback(new Error('mongodb: invalid credentials'));
        callback(null, db);
      });
    });
  });
}

DbWrapper.prototype.add = function(collection, alias) {
  alias = alias || collection;
  if (this[alias]) return this;
  this[alias] = new CollectionWrapper(collection, this.getConnectedDb.bind(this));
  return this;
};

var getConfig = function(name) {
  var db = config[name]
  return {
    host: process.env[name + '_HOST'] || db.host,
    port: process.env[name + '_PORT'] || db.port,
    name: process.env[name + '_NAME'] || db.name,
    user: process.env[name + '_USER'] || db.user,
    pass: process.env[name + '_PASS'] || db.pass
  }
}

module.exports = {
  db: new DbWrapper(getConfig('db'))
};
