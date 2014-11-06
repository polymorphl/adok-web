'use strict';

var renderZone = function(req, res, next, oauthMessage) {
  var outcome = {};
  var events = {};
  var notifications = [];
  var accountId;
  var isLinked = false;

  var getAccountData = function(callback) {
    req.app.db.models.Account.findById((accountId ? accountId : req.user.roles.account.id), 'name picture place lat lng').exec(function(err, account) {
      if (err) {
        return callback(err, null);
      }
      if (!account) {
        return callback('User not found', null);
      }
      outcome.account = account;
      callback(null, 'done');
    });
  };

  var getUserData = function(callback) {
    req.app.db.models.User.findById((req.params.id ? req.params.id : req.user.id), 'username email roles google.id facebook.id').exec(function(err, user) {
      if (err) {
        callback(err, null);
      }
      if (!user) {
        return callback('Account not found', null);
      }
      accountId = user.roles.account;
      if (accountId == undefined)
        return callback('User not found', null);
      outcome.user = user;
      return callback(null, 'done');
    });
  };

  var getLinked = function(callback) {
    if (!req.params.id || req.params.id == req.user.id)
      return callback(null, 'done');
    req.app.db.models.UserLink.findOne({$or: [{'folwr.account': req.user.roles.account._id}, {'folwd.account.id': req.user.roles.account._id}]}).exec(function(err, link) {
      if (err) {
        return callback(err, null);
      }
      if (!link) {
        isLinked = false;
      } else {
      	console.log(link.folwd.account);
      	console.log(req.user.roles.account._id);
        if (link.folwd.account.id.toString() == req.user.roles.account._id.toString()) {
          if (link.folwd.account.conf == 1)
          	isLinked = true;
          else
          	isLinked = 'pending';
        } else {
          if (link.folwd.account.conf == 1)
          	isLinked = true;
          else
          	isLinked = 'waiting';
        }
      }
      return callback(null, 'done');
    });
  };

  var getActivities = function(callback) {
    req.app.db.models.Challenge.find({acc: (req.params.id ? req.params.id : req.user.id), accType: 'account'}, 'category date title desc photos acc').exec(function(err, activities) {
      if (err)
        return callback('Error getting activities', null);
      events.activities = activities;
      return callback(null, 'done');
    })
  };

  var getNotifs = function(callback) {
    var find = {};
    var notifMsgs = require('../../../tools/Notifications').notifMsgs;
    find['to.'+req.session.accType] = req.user.roles[req.session.accType]._id;
    req.app.db.models.Notifications.find(find).sort({date: 'desc'}).limit(20).populate('from.account').populate('from.pro').populate('event.activity').populate('event.exchange').populate('event.opportunity').exec(function(err, notifs) {
      if (err)
        return null;
      // console.log(notifs);
      require('async').eachSeries(notifs, function(notif, done) {
        var push = {
          id: notif._id,
          uid: '',
          accType: '',
          who: '',
          picture: '',
          data: '',
          date: notif.date,
          link: '',
          type: notif.type,
          etype: '',
          eid: ''
        };
        if (notif.type <= 1) {
          if (notif.from.account && notif.to.account) {
            push.uid = notif.from.account._id;
            push.who = notif.from.account.name.full;
            push.picture = notif.from.account.picture;
            push.data = req.i18n.t(notifMsgs[notif.type][0]);
            push.link = '/user/' + notif.from.account.user.id;
            push.accType = 'account';
            notifications.push(push);
          } else if (notif.from.account && notif.to.pro) {
            push.uid = notif.from.account._id;
            push.who = notif.from.account.name.full;
            push.picture = notif.from.account.picture;
            push.data = req.i18n.t(notifMsgs[notif.type][1]);
            push.link = '/user/' + notif.from.account.user.id;
            notifications.push(push);
          } else if (notif.from.pro) {
            push.uid = notif.from.pro._id;
            push.who = notif.from.pro.name;
            push.picture = notif.from.pro.picture;
            push.data = req.i18n.t(notifMsgs[notif.type][1]);
            push.link = '/pro/' + notif.from.pro.user.id;
            push.accType = 'pro';
            notifications.push(push);
          }
        } else if (notif.event.activity || notif.event.exchange || notif.event.opportunity) {
          push.uid = notif.from[req.session.accType]._id;
          push.accType = req.session.accType;
          push.who = (req.session.accType == 'account' ? notif.from.account.name.full : notif.from.pro.name);
          push.picture = (req.session.accType == 'account' ? notif.from.account.picture : notif.from.pro.picture);
          push.data = req.i18n.t(notifMsgs[notif.type]);
          if (notif.event.activity) {
            push.link = '/event/activity/' + notif.event.activity._id;
            push.eid = notif.event.activity._id;
            push.etype = 'activity';
          } else if (notif.event.exchange) {
            push.link = '/event/exchange/' + notif.event.exchange._id;
            push.eid = notif.event.exchange._id;
            push.etype = 'exchange';
          } else {
            push.link = '/event/opportunity/' + notif.event.opportunity._id;
            push.eid = notif.event.opportunity._id;
            push.etype = 'opportunity';
          }
          notifications.push(push);
        }
        return done(null, 'done');
      }, function(err) {
        if (err)
          return callback(err);
        return callback(null, 'done');
      });
    });
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
			req.app.db.models.UserLink.findOne({$or:[{'folwr.account': req.user.roles.account._id}, {'folwd.account.id':req.user.roles.account._id}]}).populate('folwd.account.id').populate('folwd.pro.id').populate('folwr.account').populate('folwr.pro').exec(function(err, userLinks) {
				// if (userLinks) {
				// 	userLinks.folwd.account.forEach(pushAccounts);
				// 	userLinks.folwd.pro.forEach(pushPro);
				// }
				res.render('account/zone/user/index', {friends: {accounts: [], pros: []}});
			});
		}

		Links();
	}

  var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }
    var allEvents = [];
    allEvents.concat(events.activities, events.exchanges);
    allEvents.sort(req.app.utility.dynamicSort("date"));
    req.app.db.models.UserLink.find({ $or: [ { 'folwr.account': req.user.roles.account._id}, {'folwd.account.id': req.user.roles.account._id } ] }).select('-__v').populate('folwr.account').populate('folwd.account.id').populate('folwd.pro.id').exec(function(err, results) {
			if (err)
				res.send(400, err);
			var friends = {
				accounts: [],
				pros: []
			};
			require('async').eachSeries(results, function(row, done) {
				var friend_toPush = {};
				if (row.folwd.account && row.folwd.account && row.folwd.account.id._id) {
					if (row.folwr.account._id.toString() == req.user.roles.account._id.toString())
						friend_toPush = { id: row.folwd.account.id.user.id, pic: row.folwd.account.id.picture, name: row.folwd.account.id.name.full };
					else
						friend_toPush = { id: row.folwr.account.user.id, pic: row.folwr.account.picture, name: row.folwr.account.name.full };
					friends.accounts.push(friend_toPush);
				} else if (row.folwd.pro && row.folwd.pro.id._id) {
					friend_toPush = { id: row.folwd.pro.id.user.id, pic: row.folwd.pro.id.picture, name: row.folwd.pro.id.name };
					friends.pros.push(friend_toPush);
				}
				return done();
			});
			res.render('account/profil/index', {
	      friends: friends,
	      data: {
	        account: escape(JSON.stringify(outcome.account)),
	        user: escape(JSON.stringify(outcome.user)),
	      },
	      notifications: notifications,
	      events: events,
	      isLinked: isLinked,
	      isUserAccount: req.params.id == req.user.id,
	      avatar: outcome.account.picture,
	      oauthMessage: oauthMessage,
	      oauthGoogle: !!req.app.get('google-oauth-key'),
	      oauthGoogleActive: outcome.user.google ? !!outcome.user.google.id : false,
	      oauthFacebook: !!req.app.get('facebook-oauth-key'),
	      oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false
    	});
		});
  };

  require('async').series([getUserData, getAccountData, getLinked, getActivities, getNotifs], asyncFinally);
};

exports.init = function(req, res, next){
  res.locals.id = req.user._id;
  res.locals.accType = req.session.accType;
  renderZone(req, res, next, '');
};

exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  if (!req.user.id == req.params.id)
    return workflow.emit('exception', 'You can\'t update another user account');

  workflow.on('validate', function() {
    if (!req.body.first) {
      workflow.outcome.errfor.first = req.i18n.t('errors.required');
    }

    if (!req.body.last) {
      workflow.outcome.errfor.last = req.i18n.t('errors.required');
    }

    if (workflow.hasErrors()) {
      return workflow.emit('response');
    }

    workflow.emit('patchAccount');
  });

  workflow.on('patchAccount', function() {
    var fieldsToSet = {
      name: {
        first: req.body.first,
        last: req.body.last,
        full: req.body.first +' '+ req.body.last
      },
      phone: req.body.phone,
      place: req.body.place,
      lat: req.body.place_Lat,
      lng: req.body.place_Lng,
      search: [
        req.body.first,
        req.body.last,
        req.body.phone,
        req.body.place
      ]
    };

    req.app.db.models.Account.findByIdAndUpdate(req.user.roles.account.id, fieldsToSet, function(err, account) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.account = account;
      return workflow.emit('response');
    });
  });

  workflow.emit('validate');
};
