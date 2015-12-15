# in2-webhooks-js

Simple webhooks handle server.

## How to use
```javascript
'use strict';
const Webhook = require('in2-webhooks-js');

// create an adapter
var adapter = Webhook.GithubAdapter.create({ secret: 'test' });

// create a web hook
var webhook = Webhook.create(adapter, { port: 2626 });

// custom middleware
webhook.use(function(req, res, next) {
    console.log('Hello');
    return next();
});

// event handlers
webhook.on('ping', function(payload) {
   console.log(payload);
});
webhook.on('push', function(payload) {
   console.log(payload.commits.map(function(c){
       return c.message;
   }).join('\n'));
});

webhook.run();
```