'use strict';

var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	req.app.db.models.EventRegister.findById(req.params.erid).populate("eid uid").exec(function(err, row) {
		if (!err) {
			var mine = false;
			if (req.user._id + "" == row.uid._id + "")
				mine = true;
			res.render('events/validations/details', {row: escape(JSON.stringify(row)), isMine: mine});
		}
	});
}
