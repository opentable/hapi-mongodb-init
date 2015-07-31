describe('db-init tests', function(){
    var should = require('should'),
        p = require('../index.js'),
        db, actualIndexes = [{
          name: 'shouldbedropped'
        },
        {
          name: '_id'
        }],
        ensuredIndexes = [],
        droppedIndexes = [],
        connectOptions,
        plugin = {
            log: function(tags, log){}
        };

    var fakeMongo = {
      connect: function(a, b, cb){

        if(a == "error"){
          return cb(new Error("connect has exploded"));
        }

        connectOptions = b;

        return cb(null, {
          collection: function(){
            return {
              indexes: function(cb){
                return cb(null, actualIndexes);
              },
              ensureIndex: function(x, y, callback){
                if(x.error === 1){
                  return callback(new Error("ensureIndex has exploded"));
                }

                ensuredIndexes.push({ fields: x, names: y });
                return callback();
              },
              dropIndex: function(z, callback){
                droppedIndexes.push(z);
                return callback();
              }
            }
          },
          on: function(event, fn){},
          command: function(c, callback){ callback(); }
        });
      }
    };

    beforeEach(function(){
      ensuredIndexes = [];
      droppedIndexes = [];
    });

    it('should open the db connections', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               name: 'myconnection',
               indexes: []
            }],
            mongo: fakeMongo
          }, function(err){
            done(err);
        });
    });

    it('should pass the correct options to the mongo connect function', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               name: 'myconnection',
               indexes: []
            }],
            mongo: fakeMongo
          }, function(err){
            connectOptions.should.eql({
              server: {
                  poolSize: 10
              },
              replSet: {
                  connectWithNoPrimary: true
              }
            })
            done(err);
        });
    });

    it('should ensure the indexes', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               indexes: [
                {
                    collection: 'mycoll',
                    name: "myfield_1",
                    fields: {
                        myfield: 1
                    }
                }
               ]
            }],
            mongo: fakeMongo
          }, function(err){
            ensuredIndexes[0].fields.myfield.should.eql(1);
            ensuredIndexes[0].names.name.should.eql('myfield_1');
            done(err);
        });
    });

    it('should drop unlisted indexes', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               name: 'myconnection',
               indexes: [
                {
                    collection: 'mycoll',
                    name: "myfield_1",
                    fields: {
                        myfield: 1
                    }
                }
               ]
            }],
            mongo: fakeMongo
          }, function(err){
            droppedIndexes[0].should.eql('shouldbedropped');
            done(err);
        });
    });

    it('should not drop the _id_ index', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               name: 'myconnection',
               indexes: [
                {
                    collection: 'mycoll',
                    name: "myfield_1",
                    fields: {
                        myfield: 1
                    }
                }
               ]
            }],
            mongo: fakeMongo
          }, function(err){
            droppedIndexes.forEach(function(d){
              d.should.not.eql('_id_');
            });
            done(err);
        });
    });

    it('should pass through the expireAfterSeconds flag', function(done){
        p.register(plugin, {
          dbs: [{
            connectionString: 'mongodb://127.0.0.1/test',
            name: 'myconnection',
            indexes: [
              {
                collection: 'mycoll',
                name: 'myfield_1',
                fields: {
                  myfield: 1
                },
                expireAfterSeconds: 60
              }
            ]
          }],
          mongo: fakeMongo
        }, function(err){
          ensuredIndexes[0].names.expireAfterSeconds.should.eql(60);
          done(err);
        });
    });

   it('should not set expireAfterSeconds when it is not present in the config', function(done){
        p.register(plugin, {
          dbs: [{
            connectionString: 'mongodb://127.0.0.1/test',
            name: 'myconnection',
            indexes: [
              {
                collection: 'mycoll',
                name: 'myfield_1',
                fields: {
                  myfield: 1
                },
              }
            ]
          }],
          mongo: fakeMongo
        }, function(err){
          (ensuredIndexes[0].names.expireAfterSeconds === undefined).should.eql(true);
          done(err);
        });
    });

    it('should not manage indexes when config is turned off', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               name: 'myconnection',
               manageIndexes: false
            }],
            mongo: fakeMongo
          }, function(err){
            droppedIndexes.length.should.eql(0);
            done(err);
        });
    });

    it('should expose the db connections using the get method', function(done){
      p.register(plugin, {
        dbs: [{
             connectionString: 'mongodb://127.0.0.1:27017',
             name: 'myconnection',
             indexes: []
          }],
          mongo: fakeMongo
        }, function(err){

          p.db('myconnection').should.not.eql(undefined);
          done(err);
      });
    });

    describe('error handling', function(){
      it('should handle an error in connect', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'error',
               name: 'myconnection',
               indexes: []
            }],
            mongo: fakeMongo
          }, function(err){
            done(err == undefined ? new Error("expected an error from connect") : undefined);
        });
      });

      it('should return an index error when failOnIndexes is true', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1:27017',
               name: 'myconnection',
               indexes: [{
                 collection: 'error',
                 fields: { 'error': 1 }
               }]
            }],
            mongo: fakeMongo
          }, function(err){
            done(err == undefined ? new Error("expected an error from ensureIndex") : undefined);
        });
      });

      it('should ignore an index error when failOnIndexes is false', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1:27017',
               name: 'myconnection',
               indexes: [{
                 collection: 'error',
                 fields: { 'error': 1 }
               }]
            }],
            mongo: fakeMongo,
            failOnIndexes: false
          }, function(err){
            done(err);
        });
      });

      it('should not break when indexes is missing', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1',
               name: 'myconnection'
            }],
            mongo: fakeMongo
          }, function(err){
            done(err);
        });
      });
    });
});
