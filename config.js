/**
* Application Settings for Adok
**/

'use strict';

exports.companyName = 'adok';
exports.projectName = 'adok';
exports.systemEmail = 'contact@adok.fr';
exports.cryptoKey = 'k3yfOoR/@Ad/0K+';
exports.requireAccountVerification = true;

//Default Port
exports.port = process.env.PORT || 8000;

//Settings for Database
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URL || 'localhost/adok?safe=true'
};

//Settings for SMTP
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName,
    address: process.env.SMTP_FROM_ADDRESS || 'contact@adok.fr'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'contact@adok.fr',
    password: process.env.SMTP_PASSWORD || 'c0nt/4ct-/AOoK',
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
