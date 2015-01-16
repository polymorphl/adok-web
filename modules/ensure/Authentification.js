exports = module.exports = function(req, res, passport, next) {
	// if (req.headers.authorization && req.headers.authorization[0:5])
	if (req.headers.authorization) {
		passport.authenticate('localapikey', { session: false, failureRedirect: '/api/unauthorized' })(req, res);
		// console.log(req.headers.authorization.substring(0,5) === "Token");
		// console.log(req.headers.authorization.substring(6));
	} else if (req.isAuthenticated()) {
		return next();
	}
	res.set('X-Auth-Required', 'true');
	res.redirect('/login/?returnUrl='+ encodeURIComponent(req.originalUrl));
}
