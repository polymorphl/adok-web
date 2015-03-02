exports = module.exports = function (req, res, next) {
	req.app.db.models.Report.find().exec(function(err, results) {
		if (err)
			return next(err);
		res.render('admin/reports/index', {
			'title': 'Reports',
			'data': escape(JSON.stringify(results))
		});
	});	
};