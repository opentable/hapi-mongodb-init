Hapi mongodb-init
---

Initialises mongodb connections (per database), and manages indexes.

This module doesn't explicitly depend on mongodb, but requires it to be passed in on the options. This means you're free to use your favourite version. Tested with 1.4.7 and up.

```
var hapi = require("hapi");

hapi.createServer();

server.plugin.register({
  plugin: require("hapi-mongodb-init"),
  options: {
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
      mongo: require("mongodb")
  }
});

```
