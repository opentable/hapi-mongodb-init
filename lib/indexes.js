var async = require("async"),
    _ = require("underscore");

var shouldDropIndex = function(expectedIndexes, collection, indexName){
  if(indexName === '_id_'){
    return false;
  }

  return _.find(expectedIndexes, function(i){
    return i.collection === collection && i.name === indexName;
  }) === undefined;
};

var distinctCollections = function(indexes){
  return _.uniq(_.pluck(indexes, "collection"));
};

var dropIndexes = function(db, indexes, plugin, finish){
  var collections = distinctCollections(indexes);
  async.forEach(collections, function(c, done){
    db.collection(c).indexes(function(err, currentIndexes){
      async.forEach(currentIndexes, function(currentIndex, cb){
        if(shouldDropIndex(indexes, c, currentIndex.name)){
          db.collection(c).dropIndex(currentIndex.name, function(err){
            if(err){
                var error = new Error("Error dropping index '" + currentIndex.name + "' -> " + err);
                error.inner = err;
                return cb(error);
            }

            plugin.log(["database"], "Dropped index: " + currentIndex.name);
            cb();
          });
        }
        else{
          cb();
        }
      }, done);
    });
  }, finish);
};

module.exports.ensure = function(db, indexes, plugin, callback){

    var ensureIndex = function(indexData, done){
        var coll = db.collection(indexData.collection);

        var options = { name: indexData.name,  w: 1 };
        if(indexData.expireAfterSeconds !== undefined){
          options.expireAfterSeconds = indexData.expireAfterSeconds;
        }

        coll.ensureIndex(indexData.fields, options, function(err){
            if(err){
                return done(err);
            }

            plugin.log(["database"], "ensured index '" + indexData.name + "' on collection '" + indexData.collection + "'");
            done();
        });
    };

    async.forEach(indexes, ensureIndex,
    function(err) {
        if(err){
            return callback(err);
        }

        dropIndexes(db, indexes, plugin, callback);
    });
};
