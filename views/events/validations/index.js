var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Event.findById(req.params.id, function(err, row) {
		console.log(row);
		if (!err && row)
			res.render('events/validations/index',
				{
					title: row.title
				});
	});
}
