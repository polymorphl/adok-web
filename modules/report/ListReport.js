exports = module.exports = function (req, res, next) {
	req.app.db.models.Report.find().sort('reportId').exec(function(err, results) {
		if (err)
			return next(err);
		res.render('admin/reports/index', {
			'title': 'Reports',
			'data': escape(JSON.stringify(results))
		});
	});	
};