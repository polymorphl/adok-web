var colors = require('colors');
var socketSingleton = require("./SocketClient.js");
var socketCommunication = require('./SocketCommunication.js');


var addNotification = function(app, req, contentNotification, toUser, type) {
	toUser.forEach(function(currentUser, index, toUser) {
		var newNotification = {
			isRead: false,
			isAlert:false,
			typeEvent: (type == "network") ? 2 : type,
			from: {account: req.user.roles.account._id},
			to: currentUser,
			title: contentNotification.title,
			nameUser: req.user.roles.account.name.full,
		};
		newNotification.event = contentNotification.id;

		if (type == "network") {
			newNotification.event = {'network':{title: "Add friends",
			 from:req.user.roles.account._id.toString(), to:currentUser.toString()}};
		}
		else if (type == 3) {
			newNotification.event = {'eventRegister':{idEvent: contentNotification.idEvent,
				 from: contentNotification.from, to: contentNotification.to,
				 msg:contentNotification.msg, interaction:contentNotification.interaction}};
			newNotification.title = contentNotification.title;
		}
		req.app.db.models.Notification.create(newNotification, function(err, dataRecorded) {
			if (err !== null) {
				return ;
			}
			sendNotification(app, currentUser);
		});
	});
};

var sendNotification = function(app, account) {
	app.db.models.Notification.find({'to': account, isAlert: false}).populate('event.activity').populate('event.exchange').populate('to').exec(function(err, docs) {
		if (err) return;
		docs.forEach(function(currentNotification, index, docs) {
			var from = null;
			var to = null;
			var message = null;
			var interaction = false;

			if (currentNotification.typeEvent == 0) {
				message = ' à créer l\'évenement: ';
			}
			else if (currentNotification.typeEvent == 1) {
				message = ' propose: ';
			}
			else if (currentNotification.typeEvent == 2) {
				from = currentNotification.event.network.from;
				to = currentNotification.event.network.to;
				message = ' souhaite vous ajouter.';
			}
			else if (currentNotification.typeEvent == 3) {
				from = currentNotification.event.eventRegister.idEvent;
				to = currentNotification.event.eventRegister.from;
				message = currentNotification.event.eventRegister.msg;
				interaction = currentNotification.event.eventRegister.interaction;
			}

			app.io.of('/notification').in(currentNotification.to._id.toString()).emit("notification", {title: currentNotification.title,
				 notificationContent: {content:currentNotification, from:from, to:to, interaction:interaction},
				 type:currentNotification.typeEvent, msg:message});

			currentNotification.isAlert = true;
			currentNotification.save(function(err, fluffy) {
				console.log(err);
			});
		});
	});
};

var getLatestNotification = function(socket, app, account) {
	app.db.models.Notification.find({'to':account}).populate('event.activity').populate('event.exchange').populate('from.account').sort({'date':-1}).limit(20).exec(function(err, notifs) {
		if (err) {
			return ;
		}
    var listNotification = [];
    notifs.forEach(function(currentNotification, index, array) {
			var title = null;
			var typeEvent = null;
			var link = "http://localhost:8080/event/";
			//console.log(currentNotification);
			if (currentNotification.event.activity !== undefined) {
				title = " vous propose un évenement, " + currentNotification.event.activity.title;
				link += "event/" + currentNotification.event.activity.id;
				typeEvent = 1;
			}

      listNotification.push({'user':currentNotification.from.account.name.full, 'title':title,
			 'date':require('moment')(currentNotification.date).lang('fr').fromNow().toString(), 'link':link});
      if (index == notifs.length - 1) {
        socket.emit('displaynotification', listNotification);
      }
    });
  });
};

var checkConnection = function(app, userID) {
	console.log("[CHECK CONNECTION CALLED]".blue + userID);
	app.db.models.Notification.find({isAlert: false, 'to.account': userID.toString()}, function(err, docs) {
		// console.log("GET ITEM".green + docs);
		docs.forEach(function(currentNotification, index, array) {
			console.log("current notification : ".rainbow + currentNotification);
			sendNotification(app, currentNotification, userID);
		});
	});
};

module.exports =  {
	addNotification: addNotification,
	checkConnection: checkConnection,
  getLatestNotification : getLatestNotification,
	sendNotification: sendNotification
};
