/**
*
* PassportJS - Strategies : Local, Facebook, Google
* 2014 Edition
*
**/

'use strict';

exports = module.exports = function(app, passport) {
  var FacebookStrategy = require('passport-facebook').Strategy,
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
      LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy(
    function(username, password, done) {
      var conditions = { isActive: "yes" };
      
      if (username.indexOf('@') === -1) {
        conditions.username = username;
      }
      else {
        conditions.email = username;
      }

      app.db.models.User.findOne(conditions, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, { message: 'Utilisateur inconnu' });
        }

        var encryptedPassword = app.db.models.User.encryptPassword(password);
        if (user.password !== encryptedPassword) {
          return done(null, false, { message: 'Mot de passe invalide' });
        }

        return done(null, user);
      });
    }
  ));



  if (app.get('facebook-oauth-key')) {
    passport.use(new FacebookStrategy({
        clientID: app.get('facebook-oauth-key'),
        clientSecret: app.get('facebook-oauth-secret')
      },
      function(accessToken, refreshToken, profile, done) {
        done(null, false, {
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile
        });
      }
    ));
  }

  if (app.get('google-oauth-key')) {
    passport.use(new GoogleStrategy({
        clientID: app.get('google-oauth-key'),
        clientSecret: app.get('google-oauth-secret')
      },
      function(accessToken, refreshToken, profile, done) {
        done(null, false, {
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile
        });
      }
    ));
  }
  
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    app.db.models.User.findOne({ _id: id }).populate('roles.admin').populate('roles.account').exec(function(err, user) {
      if (user && user.roles && user.roles.admin) {
        user.roles.admin.populate("groups", function(err, admin) {
          done(err, user);
        });
      }
      else {
        done(err, user);
      }
    });
  });
};
