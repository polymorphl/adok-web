exports = module.exports = function (req, res, next) {
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
};