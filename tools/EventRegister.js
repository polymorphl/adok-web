var eTypeAsModel = {
	activity: 'Aevent',
	exchange: 'Eevent',
	opportunity: 'Oevent'
};

exports.init = function(req, res, next) {
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

exports.accept = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var eType = (/http:\/\/.*?\/.*?\/(.*?)\//).exec(req.headers.referer)[1];
	var eId = (/http:\/\/.*?\/.*?\/.*?\/(.*)/).exec(req.headers.referer)[1];
	var find = {};
	var set = {};

	req.app.db.models[eTypeAsModel[eType]].findById(eId).exec(function(err, row) {
		if (row.acc.toString() != req.user._id.toString()) {
			workflow.outcome.errors.push(req.i18n.t('event.notYourEvent'));
			return workflow.emit('response');
		}
		find['event.'+eType] = eId;
		find[req.params.type+'._id'] = req.params.uid;
		set[req.params.type+'.$.conf'] = 1;
		req.app.db.models.EventRegister.update(find, {'$set': set}).exec(function(err, count, raw) {
			if (err)
				return workflow.emit('exception', err);
			notif['type'] = 3;
			notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
			notif['to.'+req.params.type] = req.params.uid;
			notif['event.'+eType] = eId;
			req.app.db.models.Notifications.create(notif, function(err, elem) {
				if (err)
					console.log(err);
				return workflow.emit('response');
			});
		});
	});
}

exports.deny = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var eType = (/http:\/\/.*?\/.*?\/(.*?)\//).exec(req.headers.referer)[1];
	var eId = (/http:\/\/.*?\/.*?\/.*?\/(.*)/).exec(req.headers.referer)[1];
	var find = {};
	var set = {};

	req.app.db.models[eTypeAsModel[eType]].findById(eId).exec(function(err, row) {
		if (row.acc.toString() != req.user._id.toString()) {
			workflow.outcome.errors.push(req.i18n.t('event.notYourEvent'));
			return workflow.emit('response');
		}
		find['event.'+eType] = eId;
		find[req.params.type+'._id'] = req.params.uid;
		set[req.params.type+'.$.conf'] = 2;
		req.app.db.models.EventRegister.update(find, {'$set': set}).exec(function(err, count, raw) {
			if (err)
				return workflow.emit('exception', err);
			notif['type'] = 3;
			notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
			notif['to.'+req.params.type] = req.params.uid;
			notif['event.'+eType] = eId;
			req.app.db.models.Notifications.create(notif, function(err, elem) {
				if (err)
					console.log(err);
				return workflow.emit('response');
			});
		});
	});
}

exports.notifAccept = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	if (!req.body.uid || !req.body.type || !req.body.eid || !req.body.etype || !req.body.nid)
		return workflow.emit('exception', "Informations missing.");

	var eType = req.body.etype;
	var eId = req.body.eid;
	var uid = req.body.uid;
	var uType = req.body.type;
	var find = {};
	var set = {};
	var notif = {};

	req.app.db.models[eTypeAsModel[eType]].findById(eId).exec(function(err, row) {
		if (row.acc.toString() != req.user._id.toString()) {
			workflow.outcome.errors.push(req.i18n.t('event.notYourEvent'));
			return workflow.emit('response');
		}
		find['event.'+eType] = eId;
		find[uType+'._id'] = uid;
		set[uType+'.$.conf'] = 1;
		req.app.db.models.EventRegister.update(find, {'$set': set}).exec(function(err, count, raw) {
			if (err)
				return workflow.emit('exception', err);
			notif['type'] = 3;
			notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
			notif['to.'+uType] = uid;
			notif['event.'+eType] = eId;
			req.app.db.models.Notifications.findByIdAndRemove(req.body.nid, function(err, ret) {
				if (err)
					return workflow.emit('exception', err);
				req.app.db.models.Notifications.create(notif, function(err, elem) {
					if (err)
						console.log(err);
					return workflow.emit('response');
				});
			});
		});
	});
}

exports.notifDeny = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	if (!req.body.uid || !req.body.type || !req.body.eid || !req.body.etype || !req.body.nid)
		return workflow.emit('exception', "Informations missing.");

	var eType = req.body.etype;
	var eId = req.body.eid;
	var uid = req.body.uid;
	var uType = req.body.type;
	var find = {};
	var set = {};
	var notif = {};

	req.app.db.models[eTypeAsModel[eType]].findById(eId).exec(function(err, row) {
		if (row.acc.toString() != req.user._id.toString()) {
			workflow.outcome.errors.push(req.i18n.t('event.notYourEvent'));
			return workflow.emit('response');
		}
		find['event.'+eType] = eId;
		find[uType+'._id'] = uid;
		set[uType+'.$.conf'] = 2;
		req.app.db.models.EventRegister.update(find, {'$set': set}).exec(function(err, count, raw) {
			if (err)
				return workflow.emit('exception', err);
			notif['type'] = 4;
			notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
			notif['to.'+uType] = uid;
			notif['event.'+eType] = eId;
			req.app.db.models.Notifications.findByIdAndRemove(req.body.nid, function(err, ret) {
				if (err)
					return workflow.emit('exception', err);
				req.app.db.models.Notifications.create(notif, function(err, elem) {
					if (err)
						console.log(err);
					return workflow.emit('response');
				});
			});
		});
	});
}