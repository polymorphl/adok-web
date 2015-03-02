'use strict';

exports.read = function (req, res, next){
  req.app.db.models.Report.findById(req.params.id).exec(function(err, record) {
    if (err) {
      return next(err);
    }
    res.render('admin/reports/details', {
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
		workflow.emit('deleteReport');
	});

	workflow.on('deleteReport', function(err) {
		req.app.db.models.Report.findByIdAndRemove(req.params.id, function(err, badge) {
			if (err) {
				return workflow.emit('exception', err);
			}
			workflow.outcome.badge = badge;
			workflow.emit('response');
		});
	});
	workflow.emit('validate');
};