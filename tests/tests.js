describe('db-init tests', function(){
    var should = require('should');

    it('should open the db connections', function(done){
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
            mongo: require('mongodb').MongoClient
          }, function(err){
            done(err);
        });
    });
});
