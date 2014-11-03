'use strict';

exports.init = function(req, res, next){
	req.query.title = req.query.title ? req.query.title : '';

	var filters = {};
	if (req.query.title) {
		filters.title = new RegExp('.*?' + req.query.title +'.*$', 'i');
	}

	req.app.db.models.Aevent.pagedFind({
		filters: filters,
		keys: 'lat lng price date title',
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
				_id: 0,
				username: '',
				email: ''
			};
			while (results.data[n]) {
				console.log(results.data[n]._id);
				req.app.db.models.Aevent.findById(results.data[n]._id).populate('acc').populate('acc.roles.account acc.roles.pro').exec(function(err, res) {
					if (err) {
						return next(err);
					}
					else {
						us._id = res._id;
						us.username = res.acc.username;
						us.email = res.acc.email;
					}
				});
				++n;
			}
			results.filters = req.query;
			console.log();
			res.render('admin/eevents/index', { data: { results: JSON.stringify(results), us: us } });
		}
	});
};

exports.read = function(req, res, next){
	req.app.db.models.Aevent.findById(req.params.id).populate('acc').populate('acc.roles.account acc.roles.pro').exec(function(err, user) {
		if (err) {
			return next(err);
		}
		if (req.xhr) {
			res.send(user);
		}
		else {
			res.render('admin/eevents/details', { data: { record: escape(JSON.stringify(user)) } });
		}
	});
};

exports.update = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		// if (!req.body.title) {
		//   workflow.outcome.errfor.title = req.i18n.t('errors.required');
		// }
		// else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
		//   workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
		// }

		// var reg = new RegExp(req.i18n.t('dateRegex'));
		// if (!req.body.date) {
		//   workflow.outcome.errfor.date = req.i18n.t('errors.required');
		// } else if (!reg.test(req.body.date)) {
		//   workflow.outcome.errfor.date = req.i18n.t('errors.dateFormat');
		// } else if (Date.now() > moment(req.body.date+' '+req.body.time, req.i18n.t('dateFormat')).toDate()) {
		//   workflow.outcome.errfor.date = req.i18n.t('errors.dateLow');
		// }

		// if (!req.body.place) {
		//   workflow.outcome.errfor.place = req.i18n.t('errors.required');
		// } else if (!req.body.place_value || !req.body.place_Lng || !req.body.place_Lat) {
		//   workflow.outcome.errfor.place = req.i18n.t('errors.place');
		// }

		// if (!req.body.price) {
		//   workflow.outcome.errfor.price = req.i18n.t('errors.required');
		// }

		// if (!req.body.numOfPtc) {
		//   workflow.outcome.errfor.numOfPtc = req.i18n.t('errors.required');
		// }

		// if (!req.body.desc) {
		//   workflow.outcome.errfor.desc = req.i18n.t('errors.required');
		// }

		workflow.emit('UpdateCases');
	});

	workflow.on('UpdateCases', function() {
		req.app.db.models.Aevent.update({ _id: req.params.id }, {
			category: req.body.category,
			date: req.body.date,
			lat: req.body.lat,
			lng: req.body.lng,
			price: req.body.price,
			numOfPtc: req.body.numOfPtc,
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
