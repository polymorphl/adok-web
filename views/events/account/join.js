
exports.init = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var eType = (/^(http|https):\/\/.*?\/.*?\/(.*?)\//).exec(req.headers.referer)[2];
	var eId = (/^(http|https):\/\/.*?\/.*?\/.*?\/(.*)/).exec(req.headers.referer)[2];
	var userEventId;
	var userType;
	var find = {};
	var push = {};
	var notif = {};
	find['event'] = eId;
	push[req.session.accType] = { _id: req.user.roles[req.session.accType]._id};

	req.app.db.models.Event.findById(eId).populate('acc').exec(function(err, row) {
		if (err)
			return workflow.emit('exception', err);
		userEventId = row.acc.roles[row.accType];
		userType = row.accType;

	});
	req.app.db.models.EventRegister.findOne(find).populate('event').exec(function(err, row) {


		if (!row) {

			console.log("ROW : ", find);

			req.app.db.models.EventRegister.create(find, function(err, reg) {
				req.app.db.models.EventRegister.update(find, {'$push': push}, {upsert: true}, function(err, count, raw) {
					workflow.outcome.newStatus = req.i18n.t('event.pending');

					console.log("Notification pending".rainbow);

					req.app.db.models.Event.findById(eId).populate('acc').exec(function(err, row) {
						if (err)
							return workflow.emit('exception', err);
							userEventId = row.acc.roles[row.accType];
							console.log("EVENT ID : " + userEventId);
							console.log("USER FROM : " + req.user.roles[req.session.accType]._id);

							var notification = require("../../../tools/RRNotifications.js");
							notification.addNotification(req.app, req, {idEvent:eId, from: req.user.roles[req.session.accType]._id, to: userEventId, title:row.title, msg:' souhaite participer à : ', interaction:true},
								 [userEventId], 3);


						});


					return workflow.emit('response');
				});
			});
		} else {
			var pursue = true;
			var i = 0;
			while (row[req.session.accType][i]) {
				if (row[req.session.accType][i]._id.toString() == req.user.roles[req.session.accType]._id.toString()) {
					pursue = false;
					req.app.db.models.EventRegister.update(find, {'$pull': push}, function(err, count, raw) {
						if (err)
							return workflow.emit('exception', err);
						workflow.outcome.newStatus = req.i18n.t('event.go');

						console.log("Notification go".rainbow);

						return workflow.emit('response');
					});
				}
				++i;
			}
			if (pursue) {
				if (!row.event.numOfPtc || ((row.account.length + row.pro.length) < row.event.numOfPtc)) {
					req.app.db.models.EventRegister.update(find, {'$push': push}, function(err, count, raw) {
						if (err)
							return workflow.emit('exception', err);
						notif['type'] = 2;
						notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
						notif['to.'+userType] = userEventId;
						notif['event'] = eId;
						// req.app.db.models.Notifications.create(notif, function(err, elem) {
						// 	if (err)
						// 		console.log(err);
						// 	workflow.outcome.newStatus = req.i18n.t('event.pending');
						// 	return workflow.emit('response');
						// });
					});
				} else {
					workflow.outcome.errors.push(req.i18n.t('event.maxNumOfPtc'));
					return workflow.emit('response');
				}
			}
		}
	});
};
