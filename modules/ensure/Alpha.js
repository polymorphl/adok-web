var config = require('../../config');

exports = module.exports = function(req, res, next) {
	if ((config.alpha && req.user.alpha) || (!config.alpha)) {
		return next();
	}
	res.redirect('/ensureAlpha');
}
