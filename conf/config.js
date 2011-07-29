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
    },
    session: {
        secret: 'secret key',
        mongodb: {
            host: '127.0.0.1',
            port: 27017,
            options: {
                auto_reconnect: true,
                native_parser: true
            }
        }
    },
    require_login: {
        '/mypage': 1,
        '/edit': 1
    }
};
