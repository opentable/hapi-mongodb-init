var indexes = require("./indexes");

function Db(){
    this.db = {};
    this.options = {
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
}

Db.prototype.init = function(config, mongo, plugin, callback){
    mongo.connect(config.connectionString, this.options, function(err, conn){
        if(err){
            return callback(err);
        }

        conn[config.connectionString] = conn;

        conn.on("error", function (err) {
            plugin.log(["database", "error"], err.toString());
        });

        conn.on("timeout", function (err) {
            plugin.log(["database", "timeout"], err.toString());
        });

        indexes.ensure(conn, config.indexes, plugin, callback);
    });
};

Db.prototype.database = function(connString){
  return this.db[connString];
};

module.exports = Db;
