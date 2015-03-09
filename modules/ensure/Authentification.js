exports = module.exports = function(req, res, passport, next) {
	console.log(req.user);
	if (req.isAuthenticated()) {
		return next();
	}
	res.set('X-Auth-Required', 'true');
	res.redirect('/logout/');
	// res.redirect('/login/?returnUrl='+ encodeURIComponent(req.originalUrl));
}
