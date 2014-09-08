Hapi mongodb-init
---

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
