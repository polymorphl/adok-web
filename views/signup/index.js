'use strict';

var moment = require('moment');

exports.signup = function(req, res){
  var workflow = req.app.utility.workflow(req, res);
  var username;

  workflow.on('validate', function() {
    // if (!req.body.username) {
    //   workflow.outcome.errfor.username = req.i18n.t('errors.required');
    // }
    // else if (!/^[a-zA-Z0-9\-\_]+$/.test(req.body.username)) {
    //   workflow.outcome.errfor.username = req.i18n.t('errors.userformat');
    // }

    if (!req.body.lastname) {
      workflow.outcome.errfor.lastname = req.i18n.t('errors.required');
    }

    if (!req.body.firstname) {
      workflow.outcome.errfor.firstname = req.i18n.t('errors.required');
    }

    if (!req.body.email) {
      workflow.outcome.errfor.email = req.i18n.t('errors.required');
    }
    else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
      workflow.outcome.errfor.email = req.i18n.t('errors.mailformat');
    }

    if (!req.body.password) {
      workflow.outcome.errfor.password = req.i18n.t('errors.required');
    }

    if (!req.body.passwordConfirm) {
      workflow.outcome.errfor.passwordConfirm = req.i18n.t('errors.required');
    } else if (req.body.password != req.body.passwordConfirm) {
      workflow.outcome.errfor.passwordConfirm = req.i18n.t('signup.passwordmismatch');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateEmailCheck');
    // workflow.emit('duplicateUsernameCheck');
  });

  // workflow.on('duplicateUsernameCheck', function() {
  //   req.app.db.models.User.findOne({ username: req.body.username }, function(err, user) {
  //     if (err) {
  //       return workflow.emit('exception', err);
  //     }

  //     if (user) {
  //       workflow.outcome.errfor.username = req.i18n.t('errors.usertaken');
  //       return workflow.emit('response');
  //     }

  //     workflow.emit('duplicateEmailCheck');
  //   });
  // });

  workflow.on('duplicateEmailCheck', function() {
    req.app.db.models.User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.errfor.email = req.i18n.t('errors.mailtaken');
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  workflow.on('createUser', function() {
    username = (req.body.lastname+req.body.firstname+Math.floor((Math.random()*10000)+1)).toLowerCase();
    var fieldsToSet = {
      isActive: 'yes',
      username: username,
      email: req.body.email.toLowerCase(),
      password: req.app.db.models.User.encryptPassword(req.body.password),
      search: [
        username,
        req.body.email
      ]
    };
    req.app.db.models.User.create(fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.user = user;
      workflow.emit('createAccount');
    });
  });

  workflow.on('createAccount', function() {
    var fieldsToSet = {
      isVerified: req.app.get('require-account-verification') ? 'no' : 'yes',
      'name.first': req.body.firstname,
      'name.last': req.body.lastname,
      'name.full': req.body.lastname+' '+req.body.firstname,
      user: {
        id: workflow.user._id,
        name: workflow.user.username,
        email: workflow.user.email
      },
      search: [
        workflow.user.username
      ]
    };

    req.app.db.models.Account.create(fieldsToSet, function(err, account) {
      if (err) {
        return workflow.emit('exception', err);
      }
      // Copy default_avatar.jpg as Account's avatar
      var fs = require('fs');
      var rd = fs.createReadStream('./uploads/default_avatar.jpg');
      var wr = fs.createWriteStream('./uploads/avatars/' + 'account_' + account._id + '.jpg');
      rd.pipe(wr);
      req.app.db.models.Account.findByIdAndUpdate(account._id, {picture: '/uploads/avatars/' + 'account_' + account._id + '.jpg'}, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        } else if (!account) {
          return workflow.emit('exception', 'Account not found');
        }
      });      
      //update user with account
      workflow.user.roles.account = account._id;
      workflow.user.save(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('sendWelcomeEmail');
      });
    });
  });

  workflow.on('sendWelcomeEmail', function() {
    req.app.utility.sendmail(req, res, {
      from: req.app.get('smtp-from-name') +' <'+ req.app.get('smtp-from-address') +'>',
      to: req.body.email,
      subject: req.i18n.t('welc'),
      textPath: 'signup/email-text',
      htmlPath: 'signup/email-html',
      locals: {
        username: req.body.username,
        email: req.body.email,
        loginURL: 'http://'+ req.headers.host +'/login/',
        projectName: req.app.get('project-name')
      },
      success: function(message) {
        workflow.emit('logUserIn');
      },
      error: function(err) {
        console.log('Erreur d\'envoie de l\'e-mail : '+ err);
        workflow.emit('logUserIn');
      }
    });
  });

  workflow.on('logUserIn', function() {
    req.body.username = username;
    req._passport.instance.authenticate('local', function(err, user, info) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (!user) {
        workflow.outcome.errors.push('Connexion impossible ... .');
        return workflow.emit('response');
      }
      else {
        req.login(user, function(err) {
          if (err) {
            return workflow.emit('exception', err);
          }

          req.session.accType = 'account';
          console.log(req.user);
          workflow.outcome.defaultReturnUrl = '/account/settings/';//user.defaultReturnUrl();
          workflow.emit('response');
        });
      }
    })(req, res);
  });

  workflow.emit('validate');
};

exports.signupGoogle = function(req, res, next) {
  req._passport.instance.authenticate('google', { callbackURL: '/signup/google/callback/'},function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/signup/');
    }
    
    req.app.db.models.User.findOne({ 'google.id': info.profile._json.id }, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        req.session.socialProfile = info.profile;
        req.session.accType = 'account';
        res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
      }
      else {
        res.render('signup/index', {
          oauthMessage: 'Nous avons trouvé un utilisateur connecté à votre compte Google.',
          oauthFacebook: !!req.app.get('facebook-oauth-key'),
          oauthGoogle: !!req.app.get('google-oauth-key')
        });
      }
    });
  })(req, res, next);
};

exports.signupFacebook = function(req, res, next) {
  req._passport.instance.authenticate('facebook', { callbackURL: '/signup/facebook/callback/' }, function(err, user, info) {
    if (!info || !info.profile) {
      return res.redirect('/signup/');
    }

    req.app.db.models.User.findOne({ 'facebook.id': info.profile._json.id }, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.session.socialProfile = info.profile;
        req.session.accType = 'account';
        res.render('signup/social', { email: info.profile.emails && info.profile.emails[0].value || '' });
      }
      else {
        res.render('signup/index', {
          oauthMessage: 'Nous avons trouvé un utilisateur connecté à votre compte Facebook.',
          oauthFacebook: !!req.app.get('facebook-oauth-key'),
          oauthGoogle: !!req.app.get('google-oauth-key')
        });
      }
    });
  })(req, res, next);
};

exports.signupSocial = function(req, res){
  var workflow = req.app.utility.workflow(req, res);

  if (req.session.socialProfile.provider == 'google' && !req.session.socialProfile.username)
    req.session.socialProfile.username = req.session.socialProfile.displayName.toLowerCase();
  workflow.on('validate', function() {
    if (!req.body.email) {
      workflow.outcome.errfor.email = req.i18n.t('errors.required');
    }
    else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(req.body.email)) {
      workflow.outcome.errfor.email = req.i18n.t('errors.mailformat');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  });

  workflow.on('duplicateUsernameCheck', function() {
    workflow.username = req.session.socialProfile.username;
    if (!/^[a-zA-Z0-9\-\_]+$/.test(workflow.username)) {
      workflow.username = workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');
    }

    req.app.db.models.User.findOne({ username: workflow.username }, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.username = workflow.username + req.session.socialProfile.id;
      }
      else {
        workflow.username = workflow.username;
      }

      workflow.emit('duplicateEmailCheck');
    });
  });

  workflow.on('duplicateEmailCheck', function() {
    req.app.db.models.User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }

      if (user) {
        workflow.outcome.errfor.email = req.i18n.t('errors.mailtaken');
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  workflow.on('createUser', function() {
    var fieldsToSet = {
      isActive: 'yes',
      username: workflow.username,
      email: req.body.email.toLowerCase(),
      search: [
        req.body.email
      ]
    };

    fieldsToSet[req.session.socialProfile.provider] = req.session.socialProfile._json;

    req.app.db.models.User.create(fieldsToSet, function(err, user) {
      if (err) {
        return workflow.emit('exception', err);
      }
      workflow.user = user;
      workflow.emit('createAccount');
    });
  });

  workflow.on('createAccount', function() {
    var displayName = req.session.socialProfile.displayName || '';
    var nameParts = displayName.split(' ');
    var fieldsToSet = {
      isVerified: 'yes',
      'name.first': nameParts[0],
      'name.last': nameParts[1] || '',
      'name.full': displayName,
      user: {
        id: workflow.user._id,
        name: workflow.user.username,
        email: workflow.user.email
      },
      search: [
        nameParts[0],
        nameParts[1] || ''
      ]
    };
    req.app.db.models.Account.create(fieldsToSet, function(err, account) {
      if (err) {
        return workflow.emit('exception', err);
      }
      // Copy default_avatar.jpg as Account's avatar
      var fs = require('fs');
      var rd = fs.createReadStream('./uploads/default_avatar.jpg');
      var wr = fs.createWriteStream('./uploads/avatars/' + 'account_' + account._id + '.jpg');
      rd.pipe(wr);
      req.app.db.models.Account.findByIdAndUpdate(account._id, {picture: '/uploads/avatars/' + 'account_' + account._id + '.jpg'}, function(err, account) {
        if (err) {
          return workflow.emit('exception', err);
        } else if (!account) {
          return workflow.emit('exception', 'Account not found');
        }
      });
      //update user with account
      workflow.user.roles.account = account._id;
      workflow.user.save(function(err, user) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('sendWelcomeEmail');
      });
    });
  });

  workflow.on('sendWelcomeEmail', function() {
    req.app.utility.sendmail(req, res, {
      from: req.app.get('smtp-from-name') +' <'+ req.app.get('smtp-from-address') +'>',
      to: req.body.email,
      subject: req.i18n.t('welc'),
      textPath: 'signup/email-text',
      htmlPath: 'signup/email-html',
      locals: {
        username: workflow.user.username,
        email: req.body.email,
        loginURL: 'http://'+ req.headers.host +'/login/',
        projectName: req.app.get('project-name')
      },
      success: function(message) {
        workflow.emit('logUserIn');
      },
      error: function(err) {
        console.log('Error Sending Welcome Email: '+ err);
        workflow.emit('logUserIn');
      }
    });
  });

  workflow.on('logUserIn', function() {
    req.login(workflow.user, function(err) {
      if (err) {
        return workflow.emit('exception', err);
      }

      delete req.session.socialProfile;
      req.session.accType = 'account';
      workflow.outcome.defaultReturnUrl = '/account/';//workflow.user.defaultReturnUrl();
      workflow.emit('response');
    });
  });

  workflow.emit('validate');
};
