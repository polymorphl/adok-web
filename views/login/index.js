'use strict';

exports.login = function(req, res){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.username) {
      workflow.outcome.errfor.username = req.i18n.t('errors.required');
    }

    if (!req.body.password) {
      workflow.outcome.errfor.password = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('attemptLogin');
  });

  workflow.on('attemptLogin', function() {
    req._passport.instance.authenticate('local', function(err, user, info) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (!user) {
        workflow.outcome.errors.push('La combinaison utilisateur / mot de passe est introuvable ou votre compte est inactif.');
        return workflow.emit('response');
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }
          req.session.accType = 'account';
          workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};

exports.loginFacebook = function(req, res, next){
  req._passport.instance.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }, function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/login/');
    }

    req.app.db.models.User.findOne({ 'facebook.id': info.profile._json.id }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        res.render('login/index', {
          returnUrl: req.query.returnUrl || '/',
          oauthMessage: 'Aucun utilisateur connecté à ce compte Facebook. Premièrement, vous devez vous inscrire',
          oauthFacebook: !!req.app.get('facebook-oauth-key'),
          oauthGoogle: !!req.app.get('google-oauth-key')
        });
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }
          req.session.accType = 'account';
          res.redirect(user.defaultReturnUrl());
        });
      }
    });
  })(req, res, next);
};

exports.loginGoogle = function(req, res, next){
  req._passport.instance.authenticate('google', { callbackURL: '/login/google/callback/' }, function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/login/');
    }

    req.app.db.models.User.findOne({ 'google.id': info.profile._json.id }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        res.render('login/index', {
          returnUrl: req.query.returnUrl || '/',
          oauthMessage: 'Aucun utilisateur connecté à ce compte Google. Premièrement, vous devez vous inscrire',
          oauthFacebook: !!req.app.get('facebook-oauth-key'),
          oauthGoogle: !!req.app.get('google-oauth-key')
        });
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return next(err);
          }
          req.session.accType = 'account';
          res.redirect(user.defaultReturnUrl());
        });
      }
    });
  })(req, res, next);
};
