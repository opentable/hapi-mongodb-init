var indexes = require("./indexes"),
    database = {},


options = {
    plugin: {
        auto_reconnect: true,
        poolSize: 10,
        socketOptions: {
            keepAlive: 1,
            socketTimeoutMS: 120000
        }
    },
    replSet: {
        strategy: "statistical"
    }
};

module.exports.init = function(config, mongo, plugin, callback){
    mongo.connect(config.connectionString, options, function(err, db){
        if(err){
            return callback(err);
        }

        if(!database[config.connectionString]){
            database[config.connectionString] = {};
        }

        if(!database[config.connectionString]){
            database[config.connectionString] = {};
        }

        database[config.connectionString].db = db;

        db.on("error", function (err) {
            plugin.log(["database", "error"], err.toString());
        });

        db.on("timeout", function (err) {
            plugin.log(["database", "timeout"], err.toString());
        });

        indexes.ensure(db, config.indexes, plugin, callback);
    });
};
