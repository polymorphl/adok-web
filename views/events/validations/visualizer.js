'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validations.findById(req.params.id, function(err, row) {
		console.log(row);
		if (!err && row)
			res.render('events/validations/visualizer',
				{
					title: row.title
				});
	});
}
