var Db = require("./lib/db"),
    indexes = require("./lib/indexes"),
    async = require("async");

exports.register = function(plugin, options, next){

    var db = new Db();

    plugin.expose('database', db);

    plugin.log(["database-init"], "initialising db connections");

    var connect = function(connectionInfo, done){
        db.init(connectionInfo, options.mongo, plugin, function(err){
            if(err){
              return done(err);
            }

            plugin.log(["database-init"], "Opened connection for: " + connectionInfo.collection);
            done();
        });
    };

    async.forEach(options.dbs, connect, function(err){
      next(err);
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
