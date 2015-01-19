var notifMsgs = [
	['notifs.userAdd',
	'notifs.userFollow'],
	['notifs.userAddConf',
	'notifs.userAddConf'],
	'notifs.registerToEvent',
	'notifs.registerToEventConf',
	'notifs.registerToEventDeny',
	'notifs.eventFromNetwork'
];

exports.notifMsgs = notifMsgs;
exports.init = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var find = {};
	var notifsOutcome = [];

	console.log("[NOTIFICATION] => INIT with id: " + req.params.id);

	find['to.'+req.session.accType] = req.user.roles[req.session.accType]._id;
	if (req.params.id)
		find['_id'] = { '$gt': req.params.id };
	req.app.db.models.Notifications.find(find).sort({date: 'desc'}).limit(20).populate('from.account').populate('from.pro').populate('event.activity').populate('event.exchange').populate('event.opportunity').exec(function(err, notifs) {
		console.log("[FIND NOTIFICATIONS] => " + notifs);
		if (err)
			return workflow.emit('exception', err);
		require('async').eachSeries(notifs, function(notif, done) {
			var push = {
				id: notif._id,
				date: notif.date,
				data: '',
				link: ''
			};
			if (notif.type <= 1) {
				if (notif.from.account && notif.to.account) {
					push.data = '<b>' + notif.from.account.name.full + '</b> ' + req.i18n.t(notifMsgs[notif.type][0]);
					push.link = '/user/' + notif.from.account.user.id;
					notifsOutcome.push(push);
				} else if (notif.from.account && notif.to.pro) {
					push.data = '<b>' + notif.from.account.name.full + '</b> ' + req.i18n.t(notifMsgs[notif.type][1]);
					push.link = '/user/' + notif.from.account.user.id;
					notifsOutcome.push(push);
				} else if (notif.from.pro) {
					push.data = '<b>' + notif.from.pro.name + '</b> ' + req.i18n.t(notifMsgs[notif.type][1]);
					push.link = '/pro/' + notif.from.pro.user.id;
					notifsOutcome.push(push);
				}
			} else if (notif.event.activity || notif.event.exchange || notif.event.opportunity) {
				if (notif.from.account || notif.from.pro) {
					push.data = '<b>'+(notif.from.account ? notif.from.account.name.full : notif.from.pro.name)+'</b> ' + req.i18n.t(notifMsgs[notif.type]);
					if (notif.event.activity)
						push.link = '/event/activity/' + notif.event.activity._id;
					else if (notif.event.exchange)
						push.link = '/event/exchange/' + notif.event.exchange._id;
					else
						push.link = '/event/opportunity/' + notif.event.opportunity._id;
					notifsOutcome.push(push);
				}
			}
			return done(null, 'done');
		}, function(err) {
			if (err)
				return workflow.emit('exception', err);
			workflow.outcome.notifs = notifsOutcome; //ajax => response.notifs
			return workflow.emit('response');
		});
	});
}
