'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validations.find({e: req.params.id}, function(err, row) {
		console.log(row);
		if (!err && row)
			res.render('events/validations/index',{valiflux: escape(JSON.stringify(row)), legend: escape(JSON.stringify(row))});
	});
}
