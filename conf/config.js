/**
 * This configuration is template.
 * You shoud overwrite these config by "development.js" or "deployment.js"
 */
module.exports = {
    http: {
        host: 'localhost',
        front_port: 3000,
        back_port: 3000,
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
    },
    db: {
        host: 'localhost',
        port: 27017,
        database: 'livecoder'
    }
};
