exports = module.exports = function (req, res, next) {
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
};