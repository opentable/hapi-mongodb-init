var indexes = require("./indexes"),
    _ = require("underscore");

var db = {};
var options = {
    server: {
        poolSize: 5
    },
    replSet: {
        connectWithNoPrimary: true
    }
};

var manageIndexes = function(conn, config, plugin, callback){
    indexes.ensure(conn, config.indexes || [], plugin, function(err){
        if(err && config.failOnIndexes){
            return callback(err);
        }
        else if (err){
            plugin.log(["database", "error"], err);
        }
        callback();
    });
};

module.exports.init = function(config, mongo, plugin, callback){
    var opts = _.extend({
        server: _.extend({}, options.server, config.connectionOptions.server),
        replSet: _.extend({}, options.replSet, config.connectionOptions.replSet)
    }, _.omit(config.connectionOptions, ['server', 'replSet']));
    mongo.connect(config.connectionString, opts, function(err, conn){
        if(err){
            return callback(err);
        }

        if(config.collections){
            _.each(config.collections, function(collection) {
                db[collection.name] = conn.db(collection.dbName);
            });
        }
        else {
            db[config.name] = conn.db(config.dbName);
        }

        conn.on("error", function (err) {
            plugin.log(["database", "error"], err);
        });

        conn.on("timeout", function (err) {
            plugin.log(["database", "timeout"], err);
        });

        if(config.manageIndexes === false){
            return callback();
        }

        conn.db(config.dbName).command({ismaster: true}, function(err, d){
            if(err){
                return callback(err);
            }

            manageIndexes(conn.db(config.dbName), config, plugin, callback);
        });
    });
};

module.exports.get = function(name){
  return db[name];
};
