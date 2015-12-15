'use strict';

const Webhook = require('../');

var webhook = Webhook.create(Webhook.GithubAdapter.create({ secret: 'test' }), { port: 2626 });
webhook.use(function(req, res, next) {
    console.log('Here');
    console.log(req.body);
    return next();
});
webhook.on('ping', function(data) {
   console.log(data);
});

webhook.run();
