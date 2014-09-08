describe('db-init tests', function(){
    var should = require('should');
    var actualIndexes = [{
      name: 'shouldbedropped'
    }];
    var ensuredIndexes = [];
    var droppedIndexes = [];

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
        var p = require('../index.js'),
            plugin = {
                log: function(){}
            };

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
        var p = require('../index.js'),
            plugin = {
                log: function(){}
            };

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
        var p = require('../index.js'),
            plugin = {
                log: function(){}
            };

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
});
