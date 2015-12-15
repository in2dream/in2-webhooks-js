'use strict';

const crypto = require('crypto');
const assert = require('assert');

function Github(config) {
    config = config || {};
    assert(config.secret, 'config.secret is required.');

    this.secret = config.secret;
}

Github.prototype.retrieveEvent = function(req) {
    return req.headers['X-Github-Event'.toLowerCase()];
};

Github.prototype.verifySignature = function(signature, payload) {
    const self = this;
    const alg = signature.split('=').shift();
    const sign = signature.split('=').pop();

    if (typeof(payload) == 'object') payload = JSON.stringify(payload);
    return [alg, '=', crypto.createHmac(alg, self.secret).update(payload, 'utf8').digest('hex')].join('') === sign;
};

Github.prototype.data = function(event, done) {
    try {
        const parsed_body = JSON.parse(req.body);
        return done(null, parsed_body.payload);
    }
    catch (e) {
        return done(e);
    }
};

exports.create = function(config) {
    return new Github(config);
};
