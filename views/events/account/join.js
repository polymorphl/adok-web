
exports.init = function(req, res, next) {
	var workflow = req.app.utility.workflow(req, res);

	var eid = req.body.eid;
	var uid = req.user._id;

	var o = {};

	req.app.db.models.Event.findById(eid, function(err, row) {
		if (!err && row) {
			console.log("event=>", row[0]);
			o.e = row;
		} else {
			return workflow.emit('exception', err);
		}
	});

	req.app.db.models.User.findById(uid, function(err, row) {
		if (!err && row) {
			console.log("user=>", row[0]);
			o.u = row;
		} else {
			return workflow.emit('exception', err);
		}
	});

	req.app.db.models.EventRegister.find({eid: eid, uid: uid}, function(err, row) {
		var fieldSet = {
			eid: o.e._id,
			uid: o.u._id
		};
		if (!err && row[0]) {
			req.app.db.models.EventRegister.remove(fieldSet, function(err, row) {
				if (!err) {
					console.log("deleted!");
					return workflow.emit('response');
				} else {
					console.log(err);
					return workflow.emit('exception', err);
				}
			});
		} else {
			req.app.db.models.EventRegister.create(fieldSet, function(err, row) {
				if (!err) {
					console.log("created!");
					return workflow.emit('response');
				} else {
					console.log(err);
				return workflow.emit('exception', err);
				}
			});
		}
	});
};
