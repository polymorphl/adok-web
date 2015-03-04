var moment = require('moment');
var colors = require('colors');

exports = module.exports = function(req, res) {

	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		console.log('validate'.green);
		if (!req.body.title) {
			workflow.outcome.errfor.title = req.i18n.t('errors.required');
		}
		else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
			workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
		}

		var reg = new RegExp(req.i18n.t('dateRegex'));

		if (!req.body.hashtag) {
			workflow.outcome.errfor.hashtag = req.i18n.t('errors.required');
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}
		workflow.emit('insertEvent');
	});

	workflow.on('insertEvent', function() {
		console.log('insertEvent'.green);
		var fieldsToSet = {
			acc: req.user._id,
			accType: req.session.accType,
			title: req.body.title,
			desc: req.body.desc,
			hashtag: req.body.hashtag.split(" "),
			place: req.body.place_value,
			latLng: [req.body.place_Lng, req.body.place_Lat],
			toNotif: req.body.toNotif
		};
		
		req.app.db.models.Event.create(fieldsToSet, function(err, event) {
			console.log("inside".green);
			console.log(err+''.red);
			if (err) {
				return workflow.emit('exception', err);
			}
			var notif = require('../../tools/RRNotifications.js');
			notif.addNotification(req.app, req, event, req.body.toNotif, "challenge");
			workflow.outcome.event = event;
			return workflow.emit('response');
		});
		console.log("after request create");
	});

	workflow.emit('validate');
}

var Activity = function(req, res){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.body.title) {
			workflow.outcome.errfor.title = req.i18n.t('errors.required');
		}
		else if (!/^[a-zA-Z0-9\-\_\ \(\)\!]+$/.test(req.body.title)) {
			workflow.outcome.errfor.title = req.i18n.t('errors.userformat');
		}

		var reg = new RegExp(req.i18n.t('dateRegex'));


		if (!req.body.hashtag) {
			workflow.outcome.errfor.hashtag = req.i18n.t('errors.required');
		}

		if (workflow.hasErrors()) {
			return workflow.emit('response');
		}
		workflow.emit('insertAEvent');
	});

	workflow.on('insertAEvent', function() {
		var fieldsToSet = {
			acc: req.user._id,
			accType: req.session.accType,
			title: req.body.title,
			desc: req.body.desc,
			hashtag: req.body.hashtag,
			place: req.body.place_value,
			latLng: [req.body.place_Lng, req.body.place_Lat],
			toNotif: req.body.toNotif
		};
		console.log("list to user : " + req.body.toNotif);
		req.app.db.models.Aevent.create(fieldsToSet, function(err, event) {
			if (err)
				return workflow.emit('exception', err);
			var notif = require('../../tools/RRNotifications.js');
			notif.addNotification(req.app, req, event, req.body.toNotif, "challenge");
			workflow.outcome.event = event;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

