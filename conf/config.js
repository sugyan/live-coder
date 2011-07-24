/**
 * This configuration is template.
 * You shoud overwrite these config by "development.js" or "production.js"
 */
module.exports = {
    http: {
        host: 'localhost',
        port: 3000,
        cookie_secret: '********'
    },
    oauth: {
        twitter: {
            consumer: '**********************',
            consumer_secret: '******************************************'
        },
        facebook: {
            client_id: '***************',
            client_secret: '********************************'
        },
        github: {
            client_id: '********************',
            client_secret: '****************************************'
        }
    }
};
