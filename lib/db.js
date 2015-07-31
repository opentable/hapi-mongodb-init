var indexes = require("./indexes");

var db = {};
var options = {
    server: {
        poolSize: 10
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
    mongo.connect(config.connectionString, options, function(err, conn){
        if(err){
            return callback(err);
        }

        db[config.name] = conn;

        conn.on("error", function (err) {
            plugin.log(["database", "error"], err);
        });

        conn.on("timeout", function (err) {
            plugin.log(["database", "timeout"], err);
        });

        if(config.manageIndexes === false){
            return callback();
        }

        conn.command({ismaster: true}, function(err, d){
            if(err){
                return callback(err);
            }

            manageIndexes(conn, config, plugin, callback);
        });
    });
};

module.exports.get = function(name){
  return db[name];
};
