var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validations.findById(req.params.id, function(err, row) {
		if (!err && row)
			res.render('events/validations/index',
				{
					title: row[0].e.title
				});
	});
}
