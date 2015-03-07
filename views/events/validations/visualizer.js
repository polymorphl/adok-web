'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validation.findById(req.params.vid).populate("eid uid erid").exec(function(err, row) {
		if (!err) {
			res.render('events/validations/visualizer', {row: escape(JSON.stringify(row))});
		}
	});
}
