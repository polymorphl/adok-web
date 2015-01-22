var moment = require('moment');
var mongoose = require('mongoose');

exports.init = function(req, res) {
	var id = req.params.id;
	var registered;
	var find = {};
	find['event.activity'] = id;

	req.app.db.models.Event.findOne({_id: mongoose.Types.ObjectId(id), type: 0}, 'acc accType category title photos desc place numOfPtc latLng date date2 hashtag').populate('acc').exec(function(err, event) {
		if (err || !event)
			return require('../../http/index').http404(req, res);
		res.locals.id = req.user._id;
		res.locals.accType = req.session.accType;
		req.app.db.models[event.accType.capitalize()].populate(event, {path: 'acc.roles.'+event.accType}, function(err, event) {
			req.app.db.models.EventRegister.findOne({event: mongoose.Types.ObjectId(id)}).populate('account._id').exec(function(err, ereg) {
				if (err || !event)
					return require('../../http/index').http404(req, res);
				var i = 0;
				while (ereg && ereg[req.session.accType][i]) {
					if ([ereg[req.session.accType][i]._id].indexOf(req.user.roles[req.session.accType]._id)) {
						if (ereg[req.session.accType][i].conf == 1)
							registered = true;
						else if (ereg[req.session.accType][i].conf == 2)
							registered = "refused";
						else
							registered = "pending";
						break;
					} else
						i++;
				}
				registered = (registered === undefined ? false : registered);
				var participants = (ereg ? ereg['account'].concat(ereg['pro']) : []);
				var registeredCount = 0;
				i = 0;
				while (participants && participants[i]) {
					if (participants[i].conf == 1)
						++registeredCount;
					++i;
				}

				// console.log(registered);
				console.log("event => ", event);
				console.log("part".green, participants);
				if (ereg)
					res.render('events/account/activity/index', {event: escape(JSON.stringify(event)), title: event.title, hashtag: event.hashtag, isRegistered: registered, participants: participants, registeredCount: registeredCount, isUserAccount: req.user._id + "" == event.acc._id + "" ? true : false});
				else
					res.render('events/account/activity/index', {event: escape(JSON.stringify(event)), title: event.title,hashtag: event.hashtag, isRegistered: registered, participants: [], registeredCount: 0, isUserAccount: req.user._id + "" == event.acc._id + "" ? true : false});
			});
		});
	});
}

exports.edit = function(req, res) {
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		// console.log("body", req.body);
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

		if (!req.body.place) {
			workflow.outcome.errfor.place = req.i18n.t('errors.required');
		} else if (!req.body.place) {
			workflow.outcome.errfor.place = req.i18n.t('errors.place');
		}

		if (!req.body.numOfPtc) {
			workflow.outcome.errfor.numOfPtc = req.i18n.t('errors.required');
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}

		workflow.emit('insertEvent');
	});
	workflow.on('insertEvent', function() {
		console.log(moment(req.body.day+'/'+req.body.month+'/'+req.body.year));
		console.log(moment(req.body.day1+'/'+req.body.month1+'/'+req.body.year1));
		var fieldsToSet = {
			title: req.body.title,
			date: moment(req.body.month+'-'+req.body.day+'-'+req.body.year),
			date2: moment(req.body.month1+'-'+req.body.day1+'-'+req.body.year1),
			hashtag: req.body.hashtag,
			place: req.body.place,
			numOfPtc: req.body.numOfPtc,
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
