'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validation.findById(req.params.vid, function(err, row) {
		if (!err) {
			console.log(row);
			res.render('events/validations/visualizer', {row: escape(JSON.stringify(row))});
		}
	});
}
