var express = require('express');
var credis  = require('connect-redis');
var RedisStore = credis(express);

module.exports = {
    sessionStore: new RedisStore()
};
