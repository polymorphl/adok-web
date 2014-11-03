exports.AddCancelAndDeny = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var type = (/http:\/\/.*?\/(.*?)\//).exec(req.headers.referer)[1];
	var userID = (/http:\/\/.*?\/.*?\/(.*)/).exec(req.headers.referer)[1];
	type = (type == 'user' ? 'account' : 'pro');

	req.app.db.models.User.findById(userID, 'roles.'+type).exec(function(err, user) {
		if (err)
			return workflow.emit('exception', err);
		else if (!user)
			return workflow.emit('exception', 'This user does not exists');
		else if (user.roles == '{}')
			return workflow.emit('exception', 'This user does not possess this type of account');
		var find = {'$or':[]};
		var set = {};
		set['folwr.'+type] = user.roles[type];
		set['folwd.'+req.session.accType+'.id'] = req.user.roles[req.session.accType]._id;
		find['$or'].push(set);
		set = {};
		set['folwr.'+req.session.accType] = req.user.roles[req.session.accType]._id;
		set['folwd.'+type+'.id'] = user.roles[type];
		find['$or'].push(set);
		req.app.db.models.UserLink.findOne(find).exec(function(err, e) {
			if (err)
				return workflow.emit('exception', err);
			if (e) { // link exist
				if ((req.session.accType == 'pro' && e.folwd.pro && e.folwd.pro != req.user.roles['pro']) || (req.session.accType == 'account'))
					e.remove();
				return res.send(200, {success:true, newStatus: req.i18n.t('zone.addme')});
			}	else {
				var varConf = {account: 0, pro: 1};
				find = {};
				find['folwr.'+req.session.accType] = req.user.roles[req.session.accType]._id;
				find['folwd.'+type] = { id: user.roles[type], conf: varConf[type]};
				req.app.db.models.UserLink.create(find, function(err, elem) {
					if (err)
						return workflow.emit('exception', err);
					var notif = {};
					notif['type'] = 0;
					notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
					notif['to.'+type] = user.roles[type];
					req.app.db.models.Notifications.create(notif, function(err, elem) {
						if (err)
							console.log(err);
						return res.send(200, {success:true, newStatus: req.i18n.t((type == 'account' ? 'zone.remme' : 'zone.unfollow'))});
					});
				});
			}
		});
	});
}


exports.Accept = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);
	var type = (/http:\/\/.*?\/(.*?)\//).exec(req.headers.referer)[1];
	var userID = (/http:\/\/.*?\/.*?\/(.*)/).exec(req.headers.referer)[1];
	type = (type == 'user' ? 'account' : 'pro');

	req.app.db.models.User.findById(userID, 'roles.'+type).exec(function(err, user) {
		if (err)
			return workflow.emit('exception', err);
		else if (!user)
			return workflow.emit('exception', 'This user does not exists');
		else if (user.roles == '{}')
			return workflow.emit('exception', 'This user does not possess this type of account');
		var find = {'$or':[]};
		var set = {};
		set['folwr.'+type] = user.roles[type];
		set['folwd.'+req.session.accType+'.id'] = req.user.roles[req.session.accType]._id;
		find['$or'].push(set);
		set = {};
		set['folwr.'+req.session.accType] = req.user.roles[req.session.accType]._id;
		set['folwd.'+type+'.id'] = user.roles[type];
		find['$or'].push(set);
		req.app.db.models.UserLink.findOne(find).exec(function(err, e) {
			if (err)
				return workflow.emit('exception', err);
			if (e) { // link exist
				if (e.folwd.account.conf == 1) {
					e.remove();
				} else {
					e.folwd.account.conf = 1;
					e.save();
					return res.send(200, {success:true, newStatus: req.i18n.t('zone.remme')});
				}
			}
			return res.send(200, {success:true, newStatus: req.i18n.t('zone.addme')});
		});
	});
}

exports.notifAccept = function(req, res) {
	var workflow = req.app.utility.workflow(req, res);
	if (!req.body.uid || !req.body.type)
		return workflow.emit('exception', "Informations missing.");

	var type = req.body.type;
	var uid = req.body.uid;
	var find = {};
	var set = {};
	var notif = {};
	find['folwr.'+type] = uid
	find['folwd.'+req.session.accType+'.id'] = req.user.roles[req.session.accType]._id;
	set['folwd.'+type+'.conf'] = 2;
	req.app.db.models.UserLink.update(find, {'$set': set}).exec(function(err, count, raw) {
		if (err)
			return workflow.emit('exception', err);
		notif['type'] = 1;
		notif['from.'+req.session.accType] = req.user.roles[req.session.accType]._id;
		notif['to.'+type] = uid;
		req.app.db.models.Notifications.create(notif, function(err, elem) {
			if (err)
				console.log('Adding Notification: ', err);
			req.app.db.models.Notifications.findByIdAndUpdate(req.body.nid, { $set: { type: 1 } }, function(err, notif) {
				if (err)
					return workflow.emit('exception', err);
				return workflow.emit('response');
			});
		});
	});
}

exports.notifDeny = function(req, res) {
	if (!req.body.uid || !req.body.type || !req.body.nid)
		return workflow.emit('exception', "Informations missing.");

	var workflow = req.app.utility.workflow(req, res);
	var type = req.body.type;
	var uid = req.body.uid;
	var find = {};
	find['folwr.'+type] = uid
	find['folwd.'+req.session.accType+'.id'] = req.user.roles[req.session.accType]._id;
	req.app.db.models.UserLink.findOneAndRemove(find).exec(function(err, link) {
		if (err)
			return workflow.emit('exception', err);
		req.app.db.models.Notifications.findByIdAndRemove(req.body.nid, function(err, notif) {
			if (err)
				return workflow.emit('exception', err);
			return workflow.emit('response');
		});
	});
}
