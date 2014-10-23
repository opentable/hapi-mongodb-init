Hapi mongodb-init
---

Initialises mongodb connections (per database), and manages indexes.

This module doesn't explicitly depend on mongodb, but requires it to be passed in on the options. This means you're free to use your favourite version. Tested with 1.4.7 and up.

To initialise:

```
var hapi = require("hapi");

hapi.createServer();

server.plugin.register({
  plugin: require("hapi-mongodb-init"),
  options: {
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
      mongo: require("mongodb")
  }
});

```

To use inside a module:

```
var dbs = require('hapi-mongodb-init');

var db = dbs.db('myconnection');

db.collection('mycoll').findOne({ myfield: 'foo'}, function(err, value){
  console.log(value);
});
```

__You're managing indexes inside your app, isn't that dangerous?__

For small data sets, (where building indexes is trivial), we find it works.

You can turn off the index management by setting:

```
server.plugin.register({
  plugin: require("hapi-mongodb-init"),
  options: {
    dbs: [{
         connectionString: 'mongodb://127.0.0.1/test',
         name: 'myconnection',
         manageIndexes: false
      }],
      mongo: require("mongodb")
  }
});

```
