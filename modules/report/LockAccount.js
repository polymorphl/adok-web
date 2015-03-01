exports = module.exports = function (req, res, next) {
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
		req.app.db.models.Report.findById(req.body.id, function(err, report) {
			if (err) {
				return workflow.emit('exception', err || 500);
			}
			req.app.db.models.User.findByIdAndUpdate(report.to, toSet, function (err, user) {
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