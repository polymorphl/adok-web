var moment = require('moment');
var mongoose = require('mongoose');

exports.init = function(req, res) {
	var id = req.params.id;
	var registered = 0;
	var registeredCount = 0;
	var participants = [];
	var find = {};
	find['event.activity'] = id;

	req.app.db.models.Event.findOne({_id: mongoose.Types.ObjectId(id)}, 'acc accType title photos desc place latLng hashtag').populate('acc').exec(function(err, event) {
		if (err || !event)
			return require('../../http/index').http404(req, res);
		if (req.user) {	
			console.log("CONNEDTED");
			res.locals.id = req.user._id;
			res.locals.accType = req.session.accType;
			req.app.db.models[event.accType.capitalize()].populate(event, {path: 'acc.roles.'+event.accType}, function(err, event) {
				req.app.db.models.EventRegister.findOne({eid: mongoose.Types.ObjectId(id)}).exec(function(err, ereg) {
					if (err || !event)
						return require('../../http/index').http404(req, res);
					var i = 0;

					console.log("ereg : " + ereg);
					if (ereg)
						res.render('events/account/activity/index', {event: escape(JSON.stringify(event)), title: event.title, hashtag: event.hashtag, isRegistered: "true", participants: [], registeredCount: 0, isUserAccount: req.user._id + "" == event.acc._id + "" ? true : false});
					else
						res.render('events/account/activity/index', {event: escape(JSON.stringify(event)), title: event.title, hashtag: event.hashtag, isRegistered: "false", participants: [], registeredCount: 0, isUserAccount: req.user._id + "" == event.acc._id + "" ? true : false});
				});
			});
		} else {
			console.log("NOT CONNECTED");
			res.render('events/account/activity/index');
		}
	});
}

exports.edit = function(req, res) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {

		if (!req.body.id) {
			workflow.outcome.errors.push(req.i18n.t('errors.missingId'));
		}

		if (!req.body.title) {
			workflow.outcome.errfor.title = req.i18n.t('errors.required');
		}
		else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
			workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
		}

		if (!req.body.hashtag) {
			workflow.outcome.errfor.hashtag = req.i18n.t('errors.required');
		}

		// if (!req.body.place) {
		// 	workflow.outcome.errfor.place = req.i18n.t('errors.required');
		// } else if (!req.body.place) {
		// 	workflow.outcome.errfor.place = req.i18n.t('errors.place');
		// }

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}

		workflow.emit('insertEvent');
	});
	workflow.on('insertEvent', function() {
		var fieldsToSet = {
			title: req.body.title,
			hashtag: req.body.hashtag,
			place: req.body.place,
			latLng: [req.body.place_Lng, req.body.place_Lat],
			desc: req.body.desc
		};
		req.app.db.models.Event.findByIdAndUpdate(req.body.id, { $set: fieldsToSet }, function(err, event) {
			if (err)
				return workflow.emit('exception', err);
			workflow.outcome.event = event;
			console.log("worked".green);
			return workflow.emit('response');
		});
	});
	workflow.emit('validate');
}
