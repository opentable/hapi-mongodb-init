var db = require("./lib/db"),
    indexes = require("./lib/indexes"),
    _ = require("underscore"),
    async = require("async");

exports.register = function(plugin, options, next){

    var opts = _.extend({
        failOnIndexes: true,
        connectionOptions: {}
    }, options);

    plugin.log(["database-init"], "initialising db connections");

    var connect = function(connectionInfo, done){
        connectionInfo.failOnIndexes = opts.failOnIndexes;
        connectionInfo.connectionOptions = connectionInfo.connectionOptions || opts.connectionOptions;
        db.init(connectionInfo, opts.mongo, plugin, function(err){
            if(err){
              return done(err);
            }

            plugin.log(["database-init"], "Opened connection for: " + connectionInfo.name);
            done();
        });
    };

    async.forEach(options.dbs, connect, function(err){
      next(err);
    });
};

exports.db = function(name){
  return db.get(name);
};

exports.register.attributes = {
    pkg: require('./package.json')
};
