// /**
// * Application Core for Adok
// **/

'use strict';

global.__base = __dirname + '/';

//dependencies
var config = require('./config'),
    spdy = require('spdy'),
    express = require('express'),
    bodyparser = require('body-parser'),
    expressSession = require('express-session'),
    mongoStore = require('connect-mongo')(expressSession),
    i18n = require('i18next'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    passportio = require('passport.socketio'),
    multer = require('multer'), // New for fix connect.multipart warning
    sslKey = require('fs').readFileSync('ssl/localhost.key', 'utf8'),
    sslCertificate = require('fs').readFileSync('ssl/localhost.crt', 'utf8'),
    mongoose = require('mongoose'),
    mediaserver = require('media-server');

//init & debug i18next
i18n.init({
  saveMissing: true,
  debug: false
});

var SpdyOptions = {
  key: sslKey,
  cert: sslCertificate,
  windowSize: 1024 * 768,
  autoSpdy31: true
};

//create express app
var app = express();
app.expressInstance = express;
app.uuidGen = require('node-uuid').v4;
app.server = http.createServer(app); /* port 80 */
app.serverDev = http.createServer(app); /* port app.get('port') */
app.httpsServer = spdy.createServer(SpdyOptions, app);
//setup the IO on web server
var io = require('socket.io').listen(app.server);
app.io = io;

//setup mongoose
app.config = config;
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.safe = { w: 1 };
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  app.ms = mediaserver(app);
  app.ms.initialize();
  app.ms.db.once("open", function() {
    app.ms.events = app.ms.Grid.collection('events');
    app.ms.events_min = app.ms.Grid.collection('events.min');
    app.ms.avatars = app.ms.Grid.collection('avatars');
    app.ms.avatars_min = app.ms.Grid.collection('avatars.min');

    require('./models')(app, mongoose);
    console.log("Connected to mongodb " + config.mongodb.uri);
  });
});

//setup the session store THEN initialize Socket.io to avoid error accessing sessionStore
app.sessionStore = new mongoStore({ url: config.mongodb.uri }, function(e) {
	//set socket.io parameters
	io.use(passportio.authorize({
    passport: passport,
    cookieParser: require('cookie-parser'),
    key: 'connect.sid',
    secret: config.cryptoKey,
    store: app.sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,
    cookie: {httpOnly: true, secure: true}
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

  //GZIp for wep-server
  var compress = require('compression');
  app.use(compress());

  //middleware
  app.use(require('serve-favicon')(__dirname + '/public/favicon.ico'));
  app.use(i18n.handle);
  app.use(require('morgan')('dev'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/locales', express.static(path.join(__dirname, '/locales')));
  app.use('/uploads', express.static(__dirname+'/uploads'));
  // app.use(bodyparser({uploadDir:'./uploads'})); // deprecated (connect and multipart warning)
  /*  "In Connect 3.0, developers will have to individually
    include the individual middlewares where required. */
  //New middleware stack for bodyParser(); (composite middleware)
  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({extended: true}));
  app.use(require('./multer'));

  app.use(require('method-override')());
  app.use(require('cookie-parser')());
  app.use(require('express-session')({
    resave: true,
    saveUninitialized: false,
    key: 'connect.sid',
    secret: config.cryptoKey,
    store: app.sessionStore,
    cookie: {httpOnly: true}
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next){
    res.locals.mediaserverUrl = req.app.config.mediaserverUrl;
    res.locals.req = req;
    if (req.user && req.user._id)
      res.locals.id = req.user._id;
    if (req.session && req.session.accType)
      res.locals.accType = req.session.accType;
    next();
  });

  var socketCommunication = require('./tools/SocketCommunication.js');
  socketCommunication.io = io;
  socketCommunication.listenConnectionClientNotification(app);
  socketCommunication.listenConnectionComment(app);


  //error handler
  app.use(require('./views/http/index').http500);

  //global locals
  app.locals.projectName = app.get('project-name');
  app.locals.copyrightYear = new Date().getFullYear();
  app.locals.copyrightName = app.get('company-name');
  app.locals.cacheBreaker = 'br34k-01';
  app.locals.moment = require('moment');

//config express in dev environment
var env = process.env.NODE_ENV || 'development';
if (env == 'development') {
  app.use(require('errorhandler')());
  app.locals.pretty = true;
}

//setup passport
require('./passport')(app, passport);
app.passport = passport;

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

// loading tools
app.modules = require('./modules');

/* Mount /media router */
app.use('/media', require('./mediaserver')(app, passport));
app.all('/media/upload', app.modules.ensure.Authentification);

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
app.server.listen(8080);
app.serverDev.listen(app.get('port'));
