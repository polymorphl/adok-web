var mongoose = require('mongoose');

exports.init = function(req, res, next) {
	res.render('events/validations/visualizer', {title: "title"});
}