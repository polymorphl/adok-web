/**
* URL Schema for Adok
**/

'use strict';

function isBanned(req, res, next) {
	if (!(req.user.banned)) {
		return next();
	}
	return next('Votre compte a ete suspendu.');
	res.redirect('/');
}

exports = module.exports = function(app, passport) {
	//front end
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

	app.all('/', app.modules.ensure.Connected);
	app.post('/feedback', require('./views/feedback/index').sendFeedback);
	app.get('/', require('./views/index').init);
	app.post('/contact', require('./views/contact/index').sendMessage);

	//sign up
	app.post('/signup', require('./views/signup/index').signup);

	//social -- sign up
	app.post('/signup/social/', require('./views/signup/index').signupSocial);
	app.get('/signup/facebook/', passport.authenticate('facebook', { callbackURL: '/signup/facebook/callback/', scope: ['email'] }));
	app.get('/signup/facebook/callback/', require('./views/signup/index').signupFacebook);
	app.get('/signup/google/', passport.authenticate('google', { callbackURL: '/signup/google/callback/', scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/signup/google/callback/', require('./views/signup/index').signupGoogle);

	//login/out
	app.post('/login', require('./views/login/index').login);
	app.get('/login/forgot/', require('./views/login/forgot/index').init);
	app.post('/login/forgot/', require('./views/login/forgot/index').send);
	app.get('/login/reset/', require('./views/login/reset/index').init);
	app.get('/login/reset/:token/', require('./views/login/reset/index').init);
	app.put('/login/reset/:token/', require('./views/login/reset/index').set);
	app.get('/logout/', require('./views/logout/index').init);

	//social login account
	app.get('/login/facebook/', passport.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }));
	app.get('/login/facebook/callback/', require('./views/login/index').loginFacebook);
	app.get('/login/google/', passport.authenticate('google', { callbackURL: '/login/google/callback/', scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/login/google/callback/', require('./views/login/index').loginGoogle);

	//adok-adm
	app.get('/adok-adm/', require('./views/adok-adm/index').init);
	app.post('/adok-adm/', require('./views/adok-adm/index').login);

	//admin
	app.all('/admin*', app.modules.ensure.Authentification);
	app.all('/admin*', app.modules.ensure.Admin);
	app.get('/admin/', require('./views/admin/index').init);

	//admin > users
	app.get('/admin/users/', require('./views/admin/users/index').find);
	app.post('/admin/users/', require('./views/admin/users/index').create);
	app.get('/admin/users/:id/', require('./views/admin/users/index').read);
	app.put('/admin/users/:id/', require('./views/admin/users/index').update);
	app.put('/admin/users/:id/password/', require('./views/admin/users/index').password);
	app.put('/admin/users/:id/role-admin/', require('./views/admin/users/index').linkAdmin);
	app.delete('/admin/users/:id/role-admin/', require('./views/admin/users/index').unlinkAdmin);
	app.put('/admin/users/:id/role-account/', require('./views/admin/users/index').linkAccount);
	app.delete('/admin/users/:id/role-account/', require('./views/admin/users/index').unlinkAccount);
	app.delete('/admin/users/:id/', require('./views/admin/users/index').delete);

	//admin > eevents
	app.get('/admin/eevents/', require('./views/admin/eevents/index').init);
	app.get('/admin/eevents/:id/', require('./views/admin/eevents/index').read);
	app.put('/admin/eevents/:id/', require('./views/admin/eevents/index').update);

	//admin > administrators
	app.get('/admin/administrators/', require('./views/admin/administrators/index').find);
	app.post('/admin/administrators/', require('./views/admin/administrators/index').create);
	app.get('/admin/administrators/:id/', require('./views/admin/administrators/index').read);
	app.put('/admin/administrators/:id/', require('./views/admin/administrators/index').update);
	app.put('/admin/administrators/:id/permissions/', require('./views/admin/administrators/index').permissions);
	app.put('/admin/administrators/:id/groups/', require('./views/admin/administrators/index').groups);
	app.put('/admin/administrators/:id/user/', require('./views/admin/administrators/index').linkUser);
	app.delete('/admin/administrators/:id/user/', require('./views/admin/administrators/index').unlinkUser);
	app.delete('/admin/administrators/:id/', require('./views/admin/administrators/index').delete);

	//admin > admin groups
	app.get('/admin/admin-groups/', require('./views/admin/admin-groups/index').find);
	app.post('/admin/admin-groups/', require('./views/admin/admin-groups/index').create);
	app.get('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').read);
	app.put('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').update);
	app.put('/admin/admin-groups/:id/permissions/', require('./views/admin/admin-groups/index').permissions);
	app.delete('/admin/admin-groups/:id/', require('./views/admin/admin-groups/index').delete);

	//admin > accounts
	app.get('/admin/accounts/', require('./views/admin/accounts/index').find);
	app.post('/admin/accounts/', require('./views/admin/accounts/index').create);
	app.get('/admin/accounts/:id/', require('./views/admin/accounts/index').read);
	app.put('/admin/accounts/:id/', require('./views/admin/accounts/index').update);
	app.post('/admin/accounts/:id/', require('./views/admin/accounts/index').attachBadge);
	app.delete('/admin/accounts/:id/:badgeID', require('./views/admin/accounts/index').dettachBadge);
	app.put('/admin/accounts/:id/user/', require('./views/admin/accounts/index').linkUser);
	app.delete('/admin/accounts/:id/user/', require('./views/admin/accounts/index').unlinkUser);
	app.post('/admin/accounts/:id/notes/', require('./views/admin/accounts/index').newNote);
	app.post('/admin/accounts/:id/status/', require('./views/admin/accounts/index').newStatus);
	app.delete('/admin/accounts/:id/', require('./views/admin/accounts/index').delete);

	//admin > badges
	app.get('/admin/badges/', require('./views/admin/badges/index').init);
	app.post('/admin/badges/', require('./views/admin/badges/index').add);
	app.get('/admin/badges/:id/', require('./views/admin/badges/details').read);
	app.put('/admin/badges/:id/', require('./views/admin/badges/details').update);
	app.delete('/admin/badges/:id/', require('./views/admin/badges/details').delete);

	//admin > reports
	app.get('/admin/reports/', app.modules.report.ListReport);
	app.get('/admin/reports/:id', require('./views/admin/reports/details').read);
	// app.post('/admin/reports/create/', app.modules.report.CreateReport);
	// app.post('/admin/reports/lock-account/', app.modules.report.LockAccount);
	// app.post('/admin/reports/unlock-account/', app.modules.report.UnlockAccount);
	// app.delete('/admin/reports/delete/', app.modules.report.DeleteReport);

	 //admin > statuses
	app.get('/admin/statuses/', require('./views/admin/statuses/index').find);
	app.post('/admin/statuses/', require('./views/admin/statuses/index').create);
	app.get('/admin/statuses/:id/', require('./views/admin/statuses/index').read);
	app.put('/admin/statuses/:id/', require('./views/admin/statuses/index').update);
	app.delete('/admin/statuses/:id/', require('./views/admin/statuses/index').delete);

	//admin > search
	app.get('/admin/search/', require('./views/admin/search/index').find);

	//account
	app.all('/account*', app.modules.ensure.Authentification);
	app.all('/account*', app.modules.ensure.Account);
	app.all('/account*', isBanned);
	//app.all('/account*', getContactList);
	app.get('/account/', require('./views/account/index').init);

	//inDev
	app.post('/friends/add', require('./tools/follow').AddCancelAndDeny);
	app.post('/friends/cancel', require('./tools/follow').AddCancelAndDeny);
	app.post('/friends/deny', require('./tools/follow').AddCancelAndDeny);
	app.post('/friends/accept', require('./tools/follow').Accept);
	app.get('/conversations/:id', require('./tools/conversation').getConversations)

	//account > verification
	app.get('/account/verification/', require('./views/account/verification/index').init);
	app.post('/account/verification/', require('./views/account/verification/index').resendVerification);
	app.get('/account/verification/:token/', require('./views/account/verification/index').verify);

	//account > settings
	app.get('/account/settings/', require('./views/account/settings/index').init);
	app.put('/account/settings/identity/', require('./views/account/settings/index').identity);
	app.put('/account/settings/password/', require('./views/account/settings/index').password);
	app.delete('/account/settings/delete/', require('./views/account/settings/index').delete);

	//account > propose
	app.post('/propose', app.modules.propose.Propose);

	//account > zone
	app.all('/user*', app.modules.ensure.Authentification);
	app.all('/user*', isBanned);		
	app.get('/user/', function(req, res, next) {
		require('./views/'+req.session.accType+'/profil/index').init(req, res, next);
	});
	app.put('/user/', require('./views/account/profil/index').update);
	app.get('/user/:id', function(req, res, next) {
		require('./views/'+req.session.accType+'/profil/index').init(req, res, next);
	});

	//upload
	// app.all('/media/upload', app.modules.ensure.Authentification);
	// app.post('/upload/image/:type', require('./tools/image_upload').init); // check HERE !

	//follow
	app.all('/follow*', app.modules.ensure.Authentification);
	app.post('/follow', require('./tools/follow').AddCancelAndDeny);

	//notifications
	app.all('/feed*', app.modules.ensure.Authentification);
	app.all('/feed*', isBanned);		
	app.get('/feed', require('./tools/Notifications').init);
	app.get('/feed/:id', require('./tools/Notifications').init);
	app.post('/feed/follow/accept', require('./tools/follow').notifAccept);
	app.post('/feed/follow/deny', require('./tools/follow').notifDeny);

	//account > settings > social
	app.get('/account/settings/facebook/', passport.authenticate('facebook', { callbackURL: '/account/settings/facebook/callback/' }));
	app.get('/account/settings/facebook/callback/', require('./views/account/settings/index').connectFacebook);
	app.get('/account/settings/facebook/disconnect/', require('./views/account/settings/index').disconnectFacebook);
	app.get('/account/settings/google/', passport.authenticate('google', { callbackURL: '/account/settings/google/callback/', scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'] }));
	app.get('/account/settings/google/callback/', require('./views/account/settings/index').connectGoogle);
	app.get('/account/settings/google/disconnect/', require('./views/account/settings/index').disconnectGoogle);

	app.all('/event*', app.modules.ensure.Authentification);
	app.get('/event/:id', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/account/activity').init(req, res, next);
	});
	app.put('/event/:id/edit', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/account/activity').edit(req, res, next);
	});

	app.get('/event/ownerActions', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/delete').init(req, res, next);
	});
	app.put('/event/ownerActions/:id/join', function(req, res, next) {
		if (req.session.accType == 'account')
			require('./views/events/account/join').init(req, res, next);
	});

	app.get('/event/:id/validation', require('./views/events/validations/index').init);
	app.get('/event/:id/validation/:erid', require('./views/events/validations/details').init);
	app.get('/event/:id/validation/:erid/validate', require('./views/events/validations/validations').validate);
	app.get('/event/:id/validation/:erid/refuse', require('./views/events/validations/validations').refuse);

	app.put('/event/ownerActions/:id/join', require('./views/events/account/join').init);
	app.delete('/event/ownerActions/:id/delete', require('./views/events/account/delete').init);
	app.post('/eventRegister', require('./tools/EventRegister').init);
	app.post('/eventRegister/:type/:uid/accept', require('./tools/EventRegister').accept);
	app.post('/eventRegister/:type/:uid/deny', require('./tools/EventRegister').deny);
	app.post('/eventRegister/accept', require('./tools/EventRegister').notifAccept);
	app.post('/eventRegister/deny', require('./tools/EventRegister').notifDeny);

	//follow
	app.post('/follow', require('./tools/follow').AddCancelAndDeny);

	//map search
	app.all('/geocode*', app.modules.ensure.Authentification);
	app.post('/geocode/', app.modules.account.Geocoder);

	// get items
	app.all('/geojson*', app.modules.ensure.Authentification);
	app.post('/geojson/full', app.modules.account.GetFullList);
	app.post('/geojson/update', app.modules.account.RefreshList);

	//user search
	app.all('/usersearch*', app.modules.ensure.Authentification);
	app.post('/usersearch', app.modules.search.Users);

	//report
	app.get('/reports', app.modules.report.ListReport);
	app.post('/reports/create', app.modules.report.CreateReport);
	app.post('/reports/lock-account', app.modules.report.LockAccount);
	app.post('/reports/unlock-account', app.modules.report.UnlockAccount);
	app.delete('/reports/delete', app.modules.report.DeleteReport);	

	//route not found
	app.all('*', require('./views/http/index').http404);
};
