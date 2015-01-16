'use strict';

exports.init = function(req, res){
		//console.log(req.app.db.models.Badge.find({}));
		//require('async').parallel(/*mes sous-fonctions avec un [] en first*/);
		req.app.db.models.Badge.find().sort('name').exec(function(error, results) {
			if (error) {
					console.log(error);
			}
			res.render('admin/badges/index', {
				'title': 'Badges',
				'data': escape(JSON.stringify(results))
			});
		});
}

exports.add = function(req, res, callback){
	var workflow = req.app.utility.workflow(req, res);
	var newBadge = {
		name: req.body.name,
		desc: req.body.desc,
		title: req.body.title
	};

	req.app.db.models.Badge.create(newBadge, function(err, badge){
		if (err){
			return workflow.emit('exception', err);
		}
		workflow.outcome.badge = badge;
		return workflow.emit('response');
	});
};

exports.list = function(req, res, callback){
	req.app.db.models.Badge.find().sort('name').exec(function(err, badge){
		if (err){
			return workflow.emit('exception', err);
		}
		workflow.outcome.badge = badge;
		return workflow.emit('response');
	});

}