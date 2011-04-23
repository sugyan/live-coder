module.exports = {
    http: {
        host: 'localhost',
        front_port: 3000
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
    mongoose: {
        host: 'localhost',
        database: 'livecoder'
    }
};
