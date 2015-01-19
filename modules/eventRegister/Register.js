exports = module.exports = function(req, res, next) {
	var eTypeAsModel = require('_config');
	var workflow = req.app.utility.workflow(req, res);
	var eType = (/http:\/\/.*?\/.*?\/(.*?)\//).exec(req.headers.referer)[1];
	var eId = (/http:\/\/.*?\/.*?\/.*?\/(.*)/).exec(req.headers.referer)[1];
	var userEventId;
	var userType;
	var find = {};
	var push = {};
	var notif = {};
	find['event.'+eType] = eId;
	push[req.session.accType] = { _id: req.user.roles[req.session.accType]._id};

	req.app.db.models[eTypeAsModel[eType]].findById(eId).populate('acc').exec(function(err, row) {
		if (err)
			return workflow.emit('exception', err);
		userEventId = row.acc.roles[row.accType];
		userType = row.accType;
	});
	req.app.db.models.EventRegister.findOne(find).populate('event.'+eType).exec(function(err, row) {
		if (err)
			return workflow.emit('exception', err);
		if (!row) {
			req.app.db.models.EventRegister.create(find, function(err, reg) {
				if (err)
					return workflow.emit('exception', err);
				req.app.db.models.EventRegister.update(find, {'$push': push}, {upsert: true}, function(err, count, raw) {
					if (err)
						return workflow.emit('exception', err);
					notif['type'] = 2;
					notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
					notif['to.'+userType] = userEventId;
					notif['event.'+eType] = eId;
					req.app.db.models.Notifications.create(notif, function(err, elem) {
						if (err)
							console.log(err);
						workflow.outcome.newStatus = req.i18n.t('event.pending');
						return workflow.emit('response');
					});
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
						return workflow.emit('response');
					});
				}
				++i;
			}
			if (pursue) {
				if ((row.account.length + row.pro.length) < row.event[eType].numOfPtc) {
					req.app.db.models.EventRegister.update(find, {'$push': push}, function(err, count, raw) {
						if (err)
							return workflow.emit('exception', err);
						notif['type'] = 2;
						notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
						notif['to.'+userType] = userEventId;
						notif['event.'+eType] = eId;
						req.app.db.models.Notifications.create(notif, function(err, elem) {
							if (err)
								console.log(err);
							workflow.outcome.newStatus = req.i18n.t('event.pending');
							return workflow.emit('response');
						});
					});
				} else {
					workflow.outcome.errors.push(req.i18n.t('event.maxNumOfPtc'));
					return workflow.emit('response');
				}
			}
		}
	});
}
