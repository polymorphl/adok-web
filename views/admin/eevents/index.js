'use strict';

exports.init = function(req, res, next){
	req.query.title = req.query.title ? req.query.title : '';

	var filters = {};
	if (req.query.title) {
		filters.title = new RegExp('.*?' + req.query.title +'.*$', 'i');
	}

	req.app.db.models.Event.pagedFind({
		filters: filters,
		keys: 'lat lng date title start',
		limit: req.query.limit,
		page: req.query.page,
		sort: req.query.sort
	}, function(err, results) {
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.header("Cache-Control", "no-cache, no-store, must-revalidate");
			results.filters = req.query;
			res.send(results);
		}
		else {
			var n = 0;
			var us = {
				_id: 0
			};
			while (results.data[n]) {
				console.log(results.data[n]._id);
				req.app.db.models.Event.findById(results.data[n]._id).populate('acc').populate('acc.roles.account acc.roles.pro').exec(function(err, res) {
					if (err) {
						return next(err);
					}
					else {
						us._id = res._id;
					}
				});
				++n;
			}
			results.filters = req.query;
			res.render('admin/eevents/index', { data: { results: JSON.stringify(results), us: us } });
		}
	});
};

exports.read = function(req, res, next){
	req.app.db.models.Event.findById(req.params.id).populate('acc').populate('acc.roles.account acc.roles.pro').exec(function(err, user) {
		if (err) {
			return next(err);
		}
		if (req.xhr) {
			res.send(user);
		}
		req.app.db.models.Validation.find({ eid: req.params.id }).populate('uid').exec(function(err, list) {
			if (err) {
				return next(err);
			}
			if (req.xhr) {
				res.send(list);
			}
			else {
				res.render('admin/eevents/details', { data: { record: escape(JSON.stringify(user)) , validation: escape(JSON.stringify(list))} });
			}
		});
	});
};

exports.update = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {

		workflow.emit('UpdateCases');
	});

	workflow.on('UpdateCases', function() {
		req.app.db.models.Aevent.update({ _id: req.params.id }, {
			start: req.body.start,
			lat: req.body.lat,
			lng: req.body.lng,
			timeCreated: req.body.timeCreated,
			desc: req.body.desc,
			photos: req.body.photos,
			place: req.body.place,
			title: req.body.title,
		}, function(err, user) {
			if (err) {
				return workflow.emit('exception', err);
			}
			if (user) {
				// workflow.outcome.errfor.title = req.i18n.t('errors.eventtaken');
				return workflow.emit('response');
			}
		});
	});

	return workflow.emit('validate');
};

exports.delete = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not delete users.');
			return workflow.emit('response');
		}
		if (req.user._id === req.params.id) {
			workflow.outcome.errors.push('You may not delete yourself from user.');
			return workflow.emit('response');
		}
		workflow.emit('deleteEvent');
	});

	workflow.on('deleteEvent', function(err) {
		req.app.db.models.Aevent.findByIdAndRemove(req.params.id, function(err, user) {
			if (err) {
				return workflow.emit('exception', err);
			}
			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};
