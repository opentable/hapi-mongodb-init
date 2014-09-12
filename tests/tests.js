describe('db-init tests', function(){
    var should = require('should'),
        p = require('../index.js'),
        db, actualIndexes = [{
      name: 'shouldbedropped'
    }],
        ensuredIndexes = [],
        droppedIndexes = [],
        plugin = {
            log: function(){},
            expose: function(n, v){
              db = v;
            }
        };

    var fakeMongo = {
      connect: function(a, b, cb){
        cb(null, {
          collection: function(){
            return {
              indexes: function(){
                return actualIndexes;
              },
              ensureIndex: function(x, y, callback){
                ensuredIndexes.push({ fields: x, names: y });
                callback();
              },
              dropIndex: function(z, callback){
                droppedIndexes.push(z);
                callback();
              }
            }
          },
          on: function(event, fn){}
        });
      }
    }

    beforeEach(function(){
      ensuredIndexes = [];
      droppedIndexes = [];
    });

    it('should open the db connections', function(done){
        p.register(plugin, {
          dbs: [{
               connectionString: 'mongodb://127.0.0.1/test',
               indexes: []
            }],
            mongo: fakeMongo
          }, function(err){
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

    it('should expose the db connections using the get method', function(done){
      p.register(plugin, {
        dbs: [{
             connectionString: 'mongodb://127.0.0.1/test',
             indexes: []
          }],
          mongo: fakeMongo
        }, function(err){

          db.get('mongodb://127.0.0.1/test').should.not.eql(undefined);
          done(err);
      });
    });
});
