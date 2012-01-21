var redis   = require('redis');

module.exports = {
    redisClient: function () {
        return redis.createClient();
    },
    createRedisKey: function (key, user) {
        return [key, user].join(';');
    }
};
