'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.Validations.find({e: req.params.id}, function(err, row) {
		console.log(row);
		var d = {toto:"toto"};
		var i = -1;
		while (row[++i]) {
			d.push(row[i].picture);
		}
		console.log(d);
		if (!err && row)
			res.render('events/validations/index',{valiflux: escape(JSON.stringify(d)), legend: escape(JSON.stringify(d))});
	});
}
