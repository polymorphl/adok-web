/**
* Application Settings for Adok
**/

'use strict';

exports.companyName = 'adok';
exports.projectName = 'adok';
exports.systemEmail = 'contact@adok-app.fr';
exports.cryptoKey = 'k3yfOoR/@Ad/0K+';
exports.mediaserverUrl = 'http://127.0.0.1:8080/media/';
exports.requireAccountVerification = true;

//Default Port
exports.port = process.env.PORT || 80;

//Settings for Database
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URL || 'localhost/adok?safe=true'
};

//Settings for multer
exports.multer = {
  dest: './uploads/',
  fileSize: 16777216, // 16 MB
  files: 1
};

//Settings for SMTP
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName,
    address: process.env.SMTP_FROM_ADDRESS || 'contact@adok-app.fr'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'contact@adok-app.fr',
    password: process.env.SMTP_PASSWORD || '5L,091CF4]xG',
    host: process.env.SMTP_HOST || 'mail.gandi.net',
    ssl: true
  }
};

//Settings for oAuthenticiation - Thomas et Luc owner
exports.oauth = {
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '334710536706235',
    secret: process.env.FACEBOOK_OAUTH_SECRET || '2daff7d05af78c778fb550bd826f2d35'
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '458538676630-uegc4v3q7be62jq3bbh3n5uur03lcnva.apps.googleusercontent.com',
    secret: process.env.GOOGLE_OAUTH_SECRET || 'kEA42ScZtcXMANPW1kM0wKoj'
  }
};

exports.gzip = true;
