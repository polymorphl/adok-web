exports = module.exports = function(req, res, next) {
	req.app.db.models.UserLink.find({ $or: [ { 'folwr.account': req.user.roles.account._id}, {'folwd.account.id': req.user.roles.account._id } ] }).select('-__v').populate('folwr.account').populate('folwd.account.id').exec(function(err, results) {
		if (err)
			res.send(400, err);
		var toRender = [];
		require('async').eachSeries(results, function(row, done) {
			var toPush = {
				id: '',
				name: '',
				pic: ''
			};
			if (row.folwr.account && row.folwd.account && row.folwd.account.id._id) {
				if (row.folwr.account._id.toString() == req.user.roles.account._id.toString()) {
					toPush.id = row.folwd.account.id._id;
					toPush.name = row.folwd.account.id.name.full;
					toPush.pic = row.folwd.account.id.picture;
				} else {
					toPush.id = row.folwr.account._id;
					toPush.name = row.folwr.account.name.full;
					toPush.pic = row.folwr.account.picture;
				}
				toRender.push(toPush);
			}
			return done();
		});
		req.session.contacts = toRender;
		return next();
	});
}
