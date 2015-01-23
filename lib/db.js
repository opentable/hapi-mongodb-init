var indexes = require("./indexes");

var db = {};
var options = {
    server: {
        auto_reconnect: true,
        poolSize: 10,
        socketOptions: {
            keepAlive: 1
        }
    },
    replSet: {
        strategy: "statistical"
    }
};

module.exports.init = function(config, mongo, plugin, callback){
    if (!config.dontUseSocketTimeout) {
        options.server.socketOptions.socketTimeoutMS = 120000;
    }

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

        indexes.ensure(conn, config.indexes || [], plugin, callback);
    });
};

module.exports.get = function(name){
  return db[name];
};
