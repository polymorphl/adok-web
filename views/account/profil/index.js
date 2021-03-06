
'use strict';

var renderZone = function(req, res, next, oauthMessage) {
  var outcome = {};
  var events = {};
  var my_badges = {};
  var accountId;
  var isLinked = false;

  var getAccountData = function(callback) {
    req.app.db.models.Account.findById((accountId ? accountId : req.user.roles.account.id), 'name picture').exec(function(err, account) {
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

  var getBadges = function(callback) {
    var parsedList = [];

    req.app.db.models.User.findById(req.params.id).populate('roles.account').exec(function(err, account){
      if (err){
        return callback(err, null);
      }
      req.app.db.models.Account.findById(account.roles.account.id).populate('badges', 'name picture desc title').exec(function (err, acc){
        if (err)
          return callback(err, null);
        for (var i = 0; i < acc.badges.length; i++) {
          var toAdd = {
              _id: acc.badges[i]._id
            , name: acc.badges[i].name
            , title: acc.badges[i].title
            , desc: acc.badges[i].desc
            , pic: acc.badges[i].picture
          };
          parsedList.push(toAdd);
        }
        my_badges = parsedList;
        return callback(null, 'done');     
      });
    });
  };

  var getEvent = function(callback) {
    req.app.db.models.Event.find({acc: (req.params.id ? req.params.id : req.user.id), accType: 'account'}, 'title desc photos acc start latLng accType').populate("acc").exec(function(err, activities) {
      if (err)
        return callback('Error getting activities', null);
      req.app.db.models.Account.populate(activities, {path: "acc.roles.account"}, function(err, row){
        if (err)
          return callback('Error getting activities', null);
      });
      events = activities;
      return callback(null, 'done');
    })
  };

  function getNetwork(req, res) {
	  var type = req.session.accType;
	  var links = {
	    accounts: []
		};

		var pushAccounts = function(item) {
			if (item.conf == 2) {
				var toPush = {
					id: item.id.user.id,
					name: item.id.name.full,
					pic: item.id.picture,
					status: item.conf
				};
				links.accounts.push(toPush);
			}
		}

		var Links = function() {
			req.app.db.models.UserLink.findOne({$or:[{'folwr.account': req.user.roles.account._id}, {'folwd.account.id':req.user.roles.account._id}]}).populate('folwd.account.id').populate('folwr.account').exec(function(err, userLinks) {
				res.render('account/profil/index', {friends: {accounts: []}});
			});
		}

		Links();
	}

  var asyncFinally = function(err, results) {
    if (err) {
      return next(err);
    }
    var allEvents = [];
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
        events: escape(JSON.stringify(events)),
        badges: my_badges,
        isLinked: isLinked,
        isUserAccount: req.params.id == req.user.id,
        avatar: outcome.account.picture,
        oauthMessage: oauthMessage,
        oauthTwitter: !!req.app.get('twitter-oauth-key'),
        oauthTwitterActive: outcome.user.twitter ? !!outcome.user.twitter.id : false,
        oauthGoogle: !!req.app.get('google-oauth-key'),
        oauthGoogleActive: outcome.user.google ? !!outcome.user.google.id : false,
        oauthFacebook: !!req.app.get('facebook-oauth-key'),
        oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false
    	});
		});
  };

  require('async').series([getUserData, getAccountData, getLinked, getEvent, getBadges], asyncFinally);
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
      search: [
        req.body.first,
        req.body.last
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
