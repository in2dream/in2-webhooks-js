'use strict';

const async = require('async');
const events = require('events');
const util = require('util');
const crypto = require('crypto');

function Webhook(adapter, config) {
    events.EventEmitter.call(this);

    const self = this;
    this.config = config || {};
    this.adapter = adapter;
    this.middlewares = [
        function(req, res, next) {
            const signature = adapter.retrieveSignature(req);
            req.isXHub = function () {
                return signature !== undefined && signature.length > 0;
            };
            req.isValidXHub = function () {
                if (!req.isXHub()) return false;
                return adapter.verifySignature(signature, req.body);
            };
            return next();
        },
        function(req, res, next) {
            if (! req.isValidXHub()) return next();
            const event = self.adapter.retrieveEvent(req);
            if (! event) return next();

            self.adapter.data(req, function(err, data) {
                if (err) return next(err);
                self.emit(event, data);
                return next();
            });
        }
    ];
}
util.inherits(Webhook, events.EventEmitter);

Webhook.prototype.use = function(middleware) {
    this.middlewares.push(middleware);
};

Webhook.prototype.run = function(config) {
    config = config || {};
    const self = this;
    const port = config.port || self.config.port || process.env.PORT || 8888;
    const hostname = config.hostname || self.config.hostname || '0.0.0.0';
    const protocol = config.protocol || self.config.protocol || 'http';

    const http = require(protocol);

    if (! self.server) {
        self.server = http.createServer(function(req, res) {

                if (/(.*)\/favicon\.ico/.test(req.url)) return res.end('OK');

                var body = '';
                req.setEncoding('utf8');
                req.on('data', function(chunk) {
                    body += chunk.toString();
                });
                req.on('end', function() {
                    req.body = body;
                });

                async.eachSeries(self.middlewares, function(m, done) {
                    return m(req, res, done);
                }, function(err) {
                    if (err) {
                        return res.end('ERROR:' + err.message);
                    }
                    return res.end('OK');
                });

            });
        self.server.listen(port, hostname, function(){
            console.log('listen on ' + port);
        });
    }
};

exports.create = function(adapter, config) {
    return new Webhook(adapter, config);
};

exports.GithubAdapter = require('./libs/github');
