var compTab = {
	challenge: 'Challenge',
}

exports.init = function(req, res, next) {
  var workflow = req.app.utility.workflow(req, res);

	if (!req.body.etype || !req.body.eid || !req.body.action) {
		workflow.outcome.errors.push(req.i18n.t('errors.missingDatas'));
		return workflow.emit('response');
	}
	req.app.db.models[compTab[req.body.etype]].findById(req.body.eid).exec(function(err, row) {
		if (row.acc.toString() != req.user._id.toString()) {
			workflow.outcome.errors.push(req.i18n.t('event.notYourEvent'));
			return workflow.emit('response');
		}
		var find = {};
		find['event.'+req.body.etype+'.id'] = req.body.eid;
		req.app.db.models.EventRegister.findOne(find).exec(function(err, ereg) {
			if (err)
				return workflow.emit('exception', err);
			if (ereg)
				ereg.remove();
			row.remove();
			console.log(row);
			return workflow.emit('response');
		});
	});
}