'use strict';

exports.init = function(req, res){
	res.locals.id = req.user._id;
	res.locals.accType = req.session.accType;
	getNetwork(req, res);
};

function getNetwork(req, res) {
	var type = req.session.accType;
	var links = {
		accounts: [],
		pros: []
	};

	var pushAccounts = function(item) {
		if (item.conf == 2) {
			var toPush = {
				id: item.id.user.id,
				name: item.id.name.full,
				pic: item.id.picture,
				lat: item.id.lat,
				lng: item.id.lng,
				status: item.conf
			};
			links.accounts.push(toPush);
		}
	}

	var pushPro = function(item) {
		if (item.conf == 2) {
			var toPush = {
				id: item.id.user.id,
				name: item.id.name,
				pic: item.id.picture,
				lat: item.id.lat,
				lng: item.id.lng,
				status: item.conf
			};
			links.pros.push(toPush);
		}
	}

	var Links = function() {
		req.app.db.models.UserLink.findOne({'folwr.account': req.user.roles[type]._id}).populate('folwd.account.id').populate('folwd.pro.id').exec(function(err, userLinks) {
			// if (userLinks) {
			// 	userLinks.folwd.account.forEach(pushAccounts);
			// 	userLinks.folwd.pro.forEach(pushPro);
			// }
			res.render('account/network/index', {accounts: links.accounts, pros: links.pros});
		});
	}

	Links();
}
