'use strict';

const Webhook = require('../');

var webhook = Webhook.create(Webhook.GithubAdapter.create({ secret: 'test' }), { port: 2000 });
webhook.use(function(req, res, next) {
   console.log('Here');
    console.log(req);
    console.log(req.body);
    return next();
});
webhook.run();