exports = module.exports = function(req, res, next) {
	if (req.user && req.user.canPlayRoleOf('admin')) {
		return next();
	}
	res.redirect('/');
}
