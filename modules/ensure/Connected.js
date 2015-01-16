exports = module.exports = function(req, res, next) {
	if (req.isAuthenticated()) {
		if (req.session.accType == 'account') {
			if (req.user.canPlayRoleOf('account'))
				return res.redirect('/account/');
		} else if (req.session.accType == 'pro') {
			if (req.user.canPlayRoleOf('pro'))
				return res.redirect('/homepro/')
		} else if (req.user.canPlayRoleOf('admin')) {
			return res.redirect('/admin/');
		}
		return res.redirect('/logout/');
	}
	return next();
}
