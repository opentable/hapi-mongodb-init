var async = require("async");

module.exports.ensure = function(db, indexes, plugin, callback){
    var dropIndexes = function(coll, expectedIndexes, callback){
        var names = expectedIndexes.map(function(i){
            return i.name;
        });

        coll.indexes(function(err, currentIndexes){
            async.forEach(currentIndexes, function(i, done){
                if(names.indexOf(i.name) === -1 && i.name !== "_id_"){
                    coll.dropIndex(i.name, function(err){
                        if(err){
                            var error = new Error("Error dropping index '" + i.name + " -> " + err);
                            error.inner = err;
                            return done(error);
                        }

                        plugin.log(["database-init"], "Dropped index: " + i.name);
                        done();
                    });
                }
                else{
                    done();
                }

            }, function(err){
                callback(err);
            });
        });
    };

    var ensureIndexes = function(indexInfo, done){
        var coll = db.collection(indexInfo.collection);

        var ensureIndex = function(indexData, done2){
            coll.ensureIndex(indexData.fields, { name: indexData.name,  w: 1 }, function(err){
                if(err){
                    done2(err);
                }

                plugin.log(["debug"], "ensured index '" + indexData.name + "' on collection '" + indexInfo.collection + "'");
                done2();
            });
        };

        async.forEach(indexes, ensureIndex, function(err){
            if(err){
              return done(err);
            }

            dropIndexes(coll, indexes, done);
        });
    };

    async.forEach(indexes, ensureIndexes, function(err){
        callback(err);
    });
};
