exports.init = function(req, res, next){
	var regexQuery = new RegExp('^.*?'+ req.body.query +'.*$', 'i');
	var mailChecker = function(email) {
		var regex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
		return regex.test(email);
	};
	var outcome = {};
	var ret = [];
	var splited = req.body.query.split(" ");
	var find = {};

	
	if (!mailChecker(req.body.query)) {
		find['$or'] = [];
		find['$or'].push({'search': { $in: splited }});
		var i = 0;
		while (splited && splited[i]) {
			find['$or'].push({'search': { $regex: '^.*?'+splited[i]+'.*$', $options: 'i' }});
			++i;
		}
	} else {
		find['user.email'] = req.body.query;
	}
	
	var searchAccounts = function(done) {
		req.app.db.models.Account.find(find, 'name.full user.id picture').sort('name.full').limit(10).lean().exec(function(err, res) {
			if (err)
				return done(err, null);
			outcome.account = res;
			done(null, 'searchAccounts');
		});
	}

	var asyncFinally = function(err, results) {
		if (err)
			return res.jsonp([]);

		var i = 0;
		while (outcome.account && outcome.account[i]) {
			ret.push({ name: outcome.account[i].name.full, link: '/user/'+outcome.account[i].user.id });
			++i;
		}
		return res.jsonp(ret);
	}

	require('async').parallel([searchAccounts], asyncFinally);
}