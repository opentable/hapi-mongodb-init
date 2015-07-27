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

        indexes.ensure(conn, config.indexes || [], plugin, function(err){
            if(err && config.failOnIndexes){
                return callback(err);
            }
            else if (err){
                plugin.log(["database", "error"], err);
            }

            return callback();
        });
    });
};

module.exports.get = function(name){
  return db[name];
};
