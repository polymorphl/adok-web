exports = module.exports = function(req, res, next) {
	var eTypeAsModel = require('_config');
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
