'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.EventRegister.find({eid: req.params.id, completed: true}).populate("eid uid").exec(function(err, row) {
		if (!err) {
			res.render('events/validations/index',{valiflux: escape(JSON.stringify(row)), legend: escape(JSON.stringify(row))});
		}
	});
}
