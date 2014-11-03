'use strict';

exports.init = function(req, res){
  if (req.isAuthenticated()) {
    res.redirect(req.user.defaultReturnUrl());
  }
  else {
    res.render('index', {
      returnUrl: req.query.returnUrl || '/',
      oauthMessage: '',
      oauthFacebook: !!req.app.get('facebook-oauth-key'),
      oauthGoogle: !!req.app.get('google-oauth-key')
    });
  }
};