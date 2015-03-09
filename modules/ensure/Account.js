exports = module.exports = function(req, res, next) {
	if (req.user && req.user.canPlayRoleOf('account') && req.session.accType == 'account') {
		if (req.app.get('require-account-verification')) {
			if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
				return res.redirect('/account/verification/');
			}
		}
		return next();
	}
	res.redirect('/');
}
