/**
* Application Core for Adok 
**/

'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    mongoStore = require('connect-mongo')(express),
    i18n = require('i18next'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    passportio = require('passport.socketio'),
    multer = require('multer'), // New for fix connect.multipart warning
    mongoose = require('mongoose');

//init & debug i18next
i18n.init({
    saveMissing: true,
    debug: false
});

//create express app
var app = express();

//setup the web server
app.server = http.createServer(app);

//setup the IO on web server
var io = require('socket.io').listen(app.server);
app.io = io;

//setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {

});

//config data models
require('./models')(app, mongoose);

//setup the session store THEN initialize Socket.io to avoid error accessing sessionStore
app.sessionStore = new mongoStore({ url: config.mongodb.uri }, function(e) {
	//set socket.io parameters
	io.use(passportio.authorize({
		passport: passport,
		cookieParser: express.cookieParser,
		key: 'connect.sid',
		secret: config.cryptoKey,
		store: app.sessionStore,
		success: onAuthorizeSuccess,
		fail: onAuthorizeFail
	}));

	function onAuthorizeSuccess(data, accept) {
		console.log('Successful connection to socket.io');
		return accept();
	}
	function onAuthorizeFail(data, message, error, accept){
		console.log('Failed to socket.io failed:', message);
	  if(error)  throw new Error(message);
	  return accept(new Error(message));
	}
	require('./tools/Socket-io')(app);
});



//config express in all environments
app.configure(function(){
  //settings
  app.disable('x-powered-by');
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('strict routing', true);
  app.set('project-name', config.projectName);
  app.set('company-name', config.companyName);
  app.set('system-email', config.systemEmail);
  app.set('crypto-key', config.cryptoKey);
  app.set('require-account-verification', config.requireAccountVerification);

  //smtp settings
  app.set('smtp-from-name', config.smtp.from.name);
  app.set('smtp-from-address', config.smtp.from.address);
  app.set('smtp-credentials', config.smtp.credentials);

  //facebook settings
  app.set('facebook-oauth-key', config.oauth.facebook.key);
  app.set('facebook-oauth-secret', config.oauth.facebook.secret);

  //facebook settings
  app.set('google-oauth-key', config.oauth.google.key);
  app.set('google-oauth-secret', config.oauth.google.secret);

  //middleware
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(i18n.handle);
  app.use(express.logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/locales', express.static(path.join(__dirname, '/locales')));
  app.use('/uploads', express.static(__dirname+'/uploads'));
  //app.use(express.bodyParser({uploadDir:'./uploads'})); // deprecated (connect and multipart warning)
  /*  "In Connect 3.0, developers will have to individually
  		include the individual middlewares where required. */
  //New middleware stack for bodyParser(); (composite middleware)
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(multer({ dest: './uploads' }));

  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
  	key: 'connect.sid',
    secret: config.cryptoKey,
    store: app.sessionStore
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next){
    res.locals.req = req;
    if (req.user && req.user._id)
      res.locals.id = req.user._id;
    if (req.session && req.session.accType)
      res.locals.accType = req.session.accType;
    next();
  });
  app.use(app.router);

  //error handler
  app.use(require('./views/http/index').http500);

  //global locals
  app.locals.projectName = app.get('project-name');
  app.locals.copyrightYear = new Date().getFullYear();
  app.locals.copyrightName = app.get('company-name');
  app.locals.cacheBreaker = 'br34k-01';
  app.locals.moment = require('moment');
});

//config express in dev environment
app.configure('development', function(){
  app.use(express.errorHandler());
  app.locals.pretty = true;
});

//setup passport
require('./passport')(app, passport);

i18n.registerAppHelper(app);

global.download = function(url, dest) {
  var file = require('fs').createWriteStream(dest);
  var request = require('https').get(url, function(res) {
    res.pipe(file);
    file.on('finish', function() {
      file.close();
    });
  });
}

global.getLinkStatus = function(tab, uid) {
  for (var i = 0; i < tab.length; i++)
    if (tab[i].id.toString() == uid)
      return tab[i].conf;
  return false;
}

//route requests
require('./routes')(app, passport);

//setup utilities
app.utility = {};
app.utility.sendmail = require('drywall-sendmail');
app.utility.slugify = require('drywall-slugify');
app.utility.workflow = require('drywall-workflow');
app.utility.dynamicSort = function(property) {
  var sortOrder = 1;
  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  return function (a,b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
  }
};

i18n.serveClientScript(app)
    .serveDynamicResources(app)
    .serveMissingKeyRoute(app);

//listen up
app.server.listen(app.get('port'), function(){ console.log("<# --- Adok is online on port 8000 --- #>") });
