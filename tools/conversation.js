exports.getConversationsWithLast = function(req, res) {
		var returnValue = {success: true, data: ''};
		req.app.db.models.Conversation.find({ $or: [ { user_one: req.user.roles.account._id }, { user_two: req.user.roles.account._id } ] }, { reply: {$slice: 1}}).select('-__v').populate({path: 'user_one', select: 'name.full'}).populate({path: 'user_two', select: 'name.full'}).exec(function(err, row) {
			if (err) {
				returnValue.success = false;
				returnValue.data = err;
				return returnValue;
			}
			returnValue.data = row;
			return returnValue;
		});
}

exports.getConversations = function(req, res) {
	console.log(req.user.roles.account._id);
	if (!req.params.id)
		return res.send(200);
	req.app.db.models.Conversation.findOne({ $or: [ { user_one: req.user.roles.account._id, user_two: req.params.id }, { user_one: req.params.id, user_two: req.user.roles.account._id } ] }).select('-__v').populate({path: 'user_one', select: 'name.full'}).populate({path: 'user_two', select: 'name.full'}).exec(function(err, row) {
		if (err)
			return res.send(err);
		var conversation = {
			userid: '',
			username: '',
			reply: {}
		};
		if (row) {
			conversation.userid = (row.user_one._id.toString() == req.user.roles.account._id ? row.user_two._id.toString() : row.user_one._id.toString());
			conversation.username = (row.user_one._id.toString() == req.user.roles.account._id ? row.user_two.name.full : row.user_one.name.full);
			conversation.reply = row.reply;
			return res.render('../tools/conversation', conversation);
		} else {
			req.app.db.models.Account.findById(req.params.id, function(err, row) {
				if (err)
					return res.send(err);
				conversation.userid = row._id;
				conversation.username = row.name.full;
				conversation.reply = [];
				return res.render('../tools/conversation', conversation);
			});
		}
	});
}

// exports.init = function(req, res, next) {
// 	var workflow = req.app.utility.workflow(req, res);

// 	// req.app.db.models.Conversation.create({ user_one: '533894c967be672031df5609', user_two: req.user.roles.account._id, ip: '127.0.0.1'}, function(err, row) {
// 	// 	if (err)
// 	// 		return workflow.emit('exception', err);
// 	// });
// 	// req.app.db.models.Conversation.update({ _id: '53f4a751ab59051c042a5894'}, {$push: { reply: { $each: [{user: req.user.roles.account._id, text: 'toto', ip: req.connection.remoteAddress}], $position: 0 }}}, function(err, count, raw) {
// 	// 	if (err)
// 	// 		return workflow.emit('exception', err);

// 		/*
// 		** Recupere l'ensemble des conversations avec le dernier message
// 		*/
// 		req.app.db.models.Conversation.find({ $or: [ { user_one: req.user.roles.account._id }, { user_two: req.user.roles.account._id } ] }, { reply: {$slice: 1}}).select('-__v').populate({path: 'user_one', select: 'name.full'}).populate({path: 'user_two', select: 'name.full'}).exec(function(err, row) {
// 			if (err)
// 				return workflow.emit('exception', err);
// 			workflow.outcome.LastMessages = row;
// 			/*
// 			** Recupere l'ensemble des conversations avec tous les messages
// 			*/
// 			req.app.db.models.Conversation.find({ $or: [ { user_one: req.user.roles.account._id }, { user_two: req.user.roles.account._id } ] }).select('-__v').populate({path: 'user_one', select: 'name.full'}).populate({path: 'user_two', select: 'name.full'}).exec(function(err, row) {
// 				if (err)
// 					return workflow.emit('exception', err);
// 				workflow.outcome.AllMessages = row;
// 				return workflow.emit('response');
// 			});
// 		});
// 	// });
// };
