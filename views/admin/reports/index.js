'use strict';

exports.read = function  (req, res, next) {
	req.app.db.models.Report.find().sort('reportId').exec(function(err, results) {
		if (err)
			return next(err);
		res.render('admin/reports/index', {
			'title': 'Reports',
			'data': escape(JSON.stringify(results))
		});
	});
}

exports.create = function (req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.body.reportId) {
      workflow.outcome.errfor.reportId = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }
    workflow.emit('createReport');
  });

  workflow.on('createReport', function () {
		var newReport = {
			from: req.user._id,
			to: req.body.reportId,
			desc: req.body.desc
		};

		req.app.db.models.Report.create(newReport, function (err, report) {
			if (err){
				return workflow.emit('exception', err);
			}
			return workflow.emit('response');
		}); 	
  });
  workflow.emit('validate');
}

exports.lockAccount = function (req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function () {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not edit accounts.');
			return workflow.emit('response');
		}
		workflow.emit('lockAccount');
	});

	workflow.on('lockAccount', function () {
		var toSet = {
			banned: true
		};
		req.app.db.models.Report.findById(req.body.id, function(err, account) {
			if (err) {
				return workflow.emit('exception', err || 500);
			}
			req.app.db.models.User.findByIdAndUpdate(account.to, toSet, function (err, user) {
				if (err){
					return workflow.emit('exception', err || 500);
				}
				workflow.outcome.user = user;
				return workflow.emit('response');
			});
		});
	});
	workflow.emit('validate');	
}

exports.unlockAccount = function (req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function () {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not edit accounts.');
			return workflow.emit('response');
		}
		workflow.emit('unlockAccount');
	});

	workflow.on('unlockAccount', function () {
		var toSet = {
			banned: false
		};
		req.app.db.models.Report.findById(req.body.id, function(err, account) {
			if (err) {
				return workflow.emit('exception', err || 500);
			}
			req.app.db.models.User.findByIdAndUpdate(account.to, toSet, function (err, user) {
				if (err){
					return workflow.emit('exception', err || 500);
				}
				workflow.outcome.user = user;
				return workflow.emit('response');
			});
		});
	});
	workflow.emit('validate');	
}

exports.delete = function  (req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function () {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not delete reports.');
			return workflow.emit('response');
		}
		workflow.emit('deleteReport');		
	});

	workflow.on('deleteReport', function () {
		// waiting for an Id : id
		req.app.db.models.Report.findByIdAndRemove(req.body.id, function(err, report) {
			if (err) {
				return workflow.emit('exception', err);
			}
			workflow.outcome.report = report;
			workflow.emit('response');
		});		
	});
	workflow.emit('validate');	
}