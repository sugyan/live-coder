module.exports = function (app, config) {
    var index = require('./router/index')(config);
    var signin = require('./router/signin')(config);
    var livecoder = require('./router/livecoder')(config);

    app.get('/',        index.index);
    app.get('/about',   index.about);
    app.get('/signin',  index.signin);
    app.get('/signout', index.signout);
    app.get('/mypage',  index.mypage);

    app.get('/signin/twitter', signin.twitter);

    app.get('/edit',       livecoder.edit);
    app.get('/view/:user', livecoder.view);
};
