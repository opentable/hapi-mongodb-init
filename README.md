#Hapi mongodb-init
[![Build Status](https://travis-ci.org/opentable/hapi-mongodb-init.png?branch=master)](https://travis-ci.org/opentable/hapi-mongodb-init) [![NPM version](https://badge.fury.io/js/hapi-mongodb-init.png)](http://badge.fury.io/js/hapi-mongodb-init) ![Dependencies](https://david-dm.org/opentable/hapi-mongodb-init.png)

Initialises mongodb connections (per database), and manages indexes.

This module doesn't explicitly depend on mongodb, but requires it to be passed in on the options. This means you're free to use your "favourite" version.

Unfortunately thanks to the breaking changes introduced in the 2.x driver then hapi-mongodb-init@3.x.x will work with mongodb@2.x.x.

To initialise:

```js
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
              },
              unique: false
          }
         ]
      }],
      mongo: require("mongodb"),
      connectionOptions: {
          server: {
              poolSize: 15,
              socketTimeout: 10000
          },
          replSet: {
              connectWithNoPrimary: false
          }
      }
  }
});

```

`connectionOptions` parameter can be passed either as a child of options or per db. `connectionOptions` set for specific db take precedance over general ones.
Default `connectionOptions`:
```js
{
    server: {
        poolSize: 5
    },
    replSet: {
        connectWithNoPrimary: true
    }
}
```


Other options:

- `failOnIndexes` (true | false): optionally ignore any errors while managing indexes

To use inside a module:

```js
var dbs = require('hapi-mongodb-init');

var db = dbs.db('myconnection');

db.collection('mycoll').findOne({ myfield: 'foo'}, function(err, value){
  console.log(value);
});
```

__You're managing indexes inside your app, isn't that dangerous?__

For small data sets, (where building indexes is trivial), we find it works.

You can turn off the index management by setting:

```js
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
