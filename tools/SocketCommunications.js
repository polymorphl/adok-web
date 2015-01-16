var SocketCommunication = function singleton() {
	this.io = null;
	var notification = require('./RRNotifications.js');
	var comment = require('./RRComment.js');
	var clientSocketSingleton = require("./SocketClient.js");

	this.listenConnectionClientNotification = function(app) {
    this.io.of('/notification').on('connection', function(socket) {
			socket.join(socket.request.user.roles.account._id.toString());
			notification.sendNotification(app, socket.request.user.roles.account._id);

			socket.on('getnotification', function(notification) {
        require('./RRNotifications.js').getLatestNotification(socket, app, socket.request.user.roles.account._id);
      });

		});
	};

  this.listenConnectionComment = function(app) {
    var socketCom = this.io;
    var color = require('colors');
    this.io.of('/comment').on('connection', function(socket) {

      socket.on('idevent', function(idevent) {
        comment.sendCommentListEventToClient(socket, idevent, app);
      });
      socket.on('addComment', function(newComment) {
        comment.addNewComment(app, newComment, socket);
      });
    });
  };
  this.sendAlertNotification = function(socket, notification) {
    socket.of('/notification').emit("notification", notification);
  };
	this.sendAlertNotification = function(socket, notification) {
		socket.of('/notification').emit("notification", notification);
	};
};

SocketCommunication.instance = null;

SocketCommunication.sharedInstance = function(){
	if (this.instance === null){
		this.instance = new SocketCommunication();
	}
	return this.instance;
};

module.exports = SocketCommunication.sharedInstance();
