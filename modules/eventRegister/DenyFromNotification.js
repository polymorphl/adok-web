exports = module.exports = function(req, res, next) {
	var eTypeAsModel = require('_config');
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
