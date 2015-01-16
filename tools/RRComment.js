var colors = require('colors');
var socketSingleton = require("./SocketClient.js");

var addNewComment = function(app, eventId, socket) {
  console.log("add new comment");
  app.db.models.Comment.create({"acc":socket.request.user.roles.account.id,
  "event":eventId.eventid, "typeEvent":eventId.typeevent,
  "comment":eventId.comment}, function(err, dataRecorded) {
    sendCommentListEventToClient(socket, eventId, app);
  });
};

var sendCommentListEventToClient = function(socket, eventId, app) {
  app.db.models.Comment.find({event: eventId.eventid, typeEvent: eventId.typeevent}).sort({time: -1}).populate('acc').populate('acc.user.id').exec(function(err, docs) {
    if (docs === undefined) return;
    var listComment = [];
    docs.forEach(function(currentComment, index, array) {

      var moment = require('moment');
      var commentSend = {
        time: moment(currentComment.time).lang('fr').fromNow().toString(),
        comment: currentComment.comment,
        user: currentComment.acc.name.full,
        picture: currentComment.acc.picture,
        date: currentComment.time
      };
      listComment.push(commentSend);
    });
    socket.emit("comment", listComment);
  });
};

module.exports =  {
  sendCommentListEventToClient: sendCommentListEventToClient,
  addNewComment: addNewComment
};
