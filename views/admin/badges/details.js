'use strict';

exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {

    if (!req.body.picture) {
      workflow.outcome.errfor.picture = req.i18n.t('errors.required');
    }

    if (!req.body.name) {
      workflow.outcome.errfor.name = req.i18n.t('errors.required');
    }

    if (!req.body.desc) {
      workflow.outcome.errfor.desc = req.i18n.t('errors.required');
    }

    if (!req.body.title) {
      workflow.outcome.errfor.title = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }
    workflow.emit('patchAccount');
  });

  workflow.on('patchAccount', function() {
    var fieldsToSet = {
      name: req.body.name,
      desc: req.body.desc,
      title: req.body.title,
      picture: req.body.picture
    };

    req.app.db.models.Badge.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, account) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.account = account;
      return workflow.emit('response');
    });
  });
  workflow.emit('validate');
};

exports.read = function (req, res, next){
  req.app.db.models.Badge.findById(req.params.id).exec(function(err, record) {
    if (err) {
      return next(err);
    }
    res.render('admin/badges/details', {
      data: escape(JSON.stringify(record))
    });
  });
};

exports.delete = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not delete badges.');
			return workflow.emit('response');
		}
		workflow.emit('deleteBadge');
	});

	workflow.on('deleteBadge', function(err) {
		req.app.db.models.Badge.findByIdAndRemove(req.params.id, function(err, badge) {
			if (err) {
				return workflow.emit('exception', err);
			}
			workflow.outcome.badge = badge;
			workflow.emit('response');
		});
	});
	workflow.emit('validate');
};