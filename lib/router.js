module.exports = function (app, config) {
    var index = require('./router/index')(config);
    var signin = require('./router/signin')(config);

    app.get('/',       index.index);
    app.get('/about',  index.about);
    app.get('/signin', index.signin);
    app.get('/mypage', index.mypage);

    app.get('/signin/twitter', signin.twitter);
};
