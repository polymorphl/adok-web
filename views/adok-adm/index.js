'use strict';

exports.init = function(req, res){
    res.render('adok-adm/');
};

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
  	console.log("attemptLogin");
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
          req.session.accType = "admin";
          workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
          console.log(workflow.outcome.defaultReturnUrl);
          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};