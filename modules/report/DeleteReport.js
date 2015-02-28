exports = module.exports = function (req, res, next) {
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
};