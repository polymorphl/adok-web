'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validation.findById(req.params.vid).populate("eid uid erid").exec(function(err, row) {
		if (!err) {
			res.render('events/validations/details', {row: escape(JSON.stringify(row))});
		}
	});
}
