'use strict'

var clients = new Array();

module.exports = function(app) {
	var io = app.io;
	var status = false;
	io.of('/chat').on('connection', function(socket) {
		console.log('New socket',socket.id,'connected from',socket.handshake.address.address);
		if (clients[socket.request.user.roles.account._id.toString()] == undefined)
			clients[socket.request.user.roles.account._id.toString()] = new Array();
		if (!clients[socket.request.user.roles.account._id.toString()].length)
			status = true;
		clients[socket.request.user.roles.account._id.toString()].push(socket);
		socket.join(socket.request.user.roles.account._id.toString());
		if (status) {
			app.db.models.UserLink.find({$or: [{ 'folwr.account': socket.request.user.roles.account._id }, { 'folwd.account.id': socket.request.user.roles.account._id} ]}).exec(function(err, row) {
				if (err)
					throw new Error(err);
				require('async').eachSeries(row, function(client, done) {
					if (client.folwr.account.toString() == socket.request.user.roles.account._id.toString()) {
						io.of('/chat').in(client.folwd.account.id.toString()).emit('update_status', socket.request.user.roles.account._id, true);
						if (clients[client.folwd.account.id.toString()] != undefined && clients[client.folwd.account.id.toString()].length)
							io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('update_status', client.folwd.account.id, true);
					} else {
						io.of('/chat').in(client.folwr.account.toString()).emit('update_status', socket.request.user.roles.account._id, true);
						if (clients[client.folwr.account.toString()] != undefined && clients[client.folwr.account.toString()].length)
							io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('update_status', client.folwr.account, true);
						else
							io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('update_status', client.folwr.account, false);
					}
					done();
				});
			});
			status = false;
		}

		/*
		** Removes socket.id from clients list when disconnecting
		*/
		socket.on('disconnect', function() {
			var index = clients[socket.request.user.roles.account._id.toString()].indexOf(socket);
			if (index != -1) {
				clients[socket.request.user.roles.account._id.toString()].splice(index, 1);
				if (!clients[socket.request.user.roles.account._id.toString()].length) {
					app.db.models.UserLink.find({$or: [{ 'folwr.account': socket.request.user.roles.account._id }, { 'folwd.account.id': socket.request.user.roles.account._id} ]}).exec(function(err, row) {
						if (err)
							throw new Error(err);
						require('async').eachSeries(row, function(client, done) {
							if (client.folwr.account.toString() == socket.request.user.roles.account._id.toString())
								io.of('/chat').in(client.folwd.account.id.toString()).emit('update_status', socket.request.user.roles.account._id, false);
							else
								io.of('/chat').in(client.folwr.account.toString()).emit('update_status', socket.request.user.roles.account._id, false);
							done();
						});
					});
				}
			}
		});

		/*
		** Message dispatcher + message status(sent/not sent)
		*/
		socket.on('message', function(to, message) {
			app.db.models.Conversation.findOne({ $or: [ { user_one: socket.request.user.roles.account._id, user_two: to }, { user_one: to, user_two: socket.request.user.roles.account._id}]}, function(err, row) {
				if (err) {
						return io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('message', to, { me: socket.request.user.roles.account._id, state: false, msg: message });
				}
				if (!row) {
					app.db.models.Conversation.create({ user_one: socket.request.user.roles.account._id, user_two: to, ip: socket.handshake.address.address}, function(err, row) {
						if (err)
							return io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('message', to, { me: socket.request.user.roles.account._id, state: false, msg: message });
						row.reply.unshift({ user: socket.request.user.roles.account._id, text: message, ip: socket.handshake.address.address });
						row.save(function(err, row, count) {
							if (err || !count)
								return io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('message', to, { me: socket.request.user.roles.account._id, state: false, msg: message });
							io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('message', to, { me: socket.request.user.roles.account._id, state: true, msg: message });
							io.of('/chat').in(to).emit('new_message', {id: socket.request.user.roles.account._id, name: socket.request.user.roles.account.name.full}, { me: to, state: true, msg: message });
						});
					});
				} else {
					app.db.models.Conversation.update({ $or: [ { user_one: socket.request.user.roles.account._id, user_two: to }, { user_one: to, user_two: socket.request.user.roles.account._id}]},
					{ $push: { reply: { $each: [{ user: socket.request.user.roles.account._id, text: message, ip: socket.handshake.address.address }], $position: 0 }}}, function(err, count, raw) {
						if (err)
							return io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('message', to, { me: socket.request.user.roles.account._id, state: false, msg: message });
						io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('message', to, { me: socket.request.user.roles.account._id, state: true, msg: message });
						io.of('/chat').in(to).emit('new_message', {id: socket.request.user.roles.account._id, name: socket.request.user.roles.account.name.full}, { me: to, state: true, msg: message });
					});
				}
			});
		});

		socket.on('conversation', function(id, page) {
			app.db.models.Conversation.findOne({ $or: [{ user_one: socket.request.user.roles.account._id, user_two: id }, { user_one: id, user_two: socket.request.user.roles.account._id }] }, { reply: { $slice: [page*20, 20] }}).select('-__v').populate({path: 'user_one', select: 'name.full'}).populate({path: 'user_two', select: 'name.full'}).exec(function(err, row) {
				if (err)
					return socket.emit('conversation', id, null);
				io.of('/chat').in(socket.request.user.roles.account._id.toString()).emit('conversation', id, row);
			});
		});

		socket.on('typing', function(id, state) {
			io.of('/chat').in(id).emit('is_typing', socket.request.user.roles.account._id, state);
		});

	});
}
