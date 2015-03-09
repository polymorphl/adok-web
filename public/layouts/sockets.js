  'use strict';

$(document).ready(function() {
  var app = app || {};
	var socket = io.connect(websocketUrl +'chat', { secure: true });

	socket.io._reconnectionDelayMax = 10000;
	app.chats = new Array();

	function scrollToBottom(_this) {
		_this.scrollTop = _this.scrollHeight;
	}

	var sendMessage = function(to, message) {
		socket.emit('message', to, message, function(){});
	}

	var pushMessage = function(conversation, u, message, e) {
		var node;

		node = '<p class="'+(u ? 'left' : 'right')+'"'+(e ? ' style="background-color: red;"' : '')+'>';
		node += message;
		node += '</p>';
		conversation.append(node);
		scrollToBottom(conversation[0]);
	}

	var prependMessage = function(conversation, u, message, e) {
		var node;

		node = '<p class="'+(u ? 'left' : 'right')+'"'+(e ? ' style="background-color: red;"' : '')+'>';
		node += message;
		node += '</p>';
		conversation.prepend(node);
		scrollToBottom(conversation[0]);
	}

	$("div.conversation").each(function() {
		scrollToBottom(this);
	});

	app.ContactData = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			id: '',
			name: '',
			pic: '',
			state: false,
			reply: []
		}
	});

	app.ContactView = Backbone.View.extend({
		el: '.conversation-list',
		template: _.template( $('#tmpl-chat').html() ),
		events: {
			'keypress .message-input': 'sendMessage',
			'click div.close': 'closeChat'
		},
		initialize: function(options) {
			var that = this;
			this.timeout = null;
			this.model = new app.ContactData();
			this.model.set(options);
			this.typing = false;
			this.timeout = undefined;
			this.render();
			this.timeoutFunction = function (self) {
				self.typing = false;
				socket.emit('typing', self.model.attributes.id, self.typing);
			};
			socket.on('message', function(from, data) {
				if (from.toString() == that.model.attributes.id) {
					pushMessage($("div.chat[user='"+from.toString()+"']").find("div.conversation"), from.toString() != that.model.attributes.id, data.msg, (data.state != undefined ? !data.state : false));
					return this;
				}
			});
			socket.on('conversation', function(id, con) {
				if (id == that.model.attributes.id)
					_.each(con.reply, function(item) {
						prependMessage($("div.chat[user='"+that.model.attributes.id+"']").find("div.conversation"), item.user.toString() == that.model.attributes.id, item.text, false);
					});
			});
			socket.on('is_typing', function(id, state) {
				if (id == that.model.attributes.id)
					console.log(id,(state ? "is writing..." : "stoped writing"));
			});
			this.$el.find('textarea').focus();
		},
		render: function() {
			var that = this;
			this.$el.append(this.template( this.model.attributes ));
			socket.emit('conversation', that.model.attributes.id, 0);
			return this;
		},
		sendMessage: function(e) {
			if ((e.ctrlKey && e.which == 10) || (e.which != 13)) {
				if (!this.typing) {
					this.typing = true;
					socket.emit('typing', this.model.attributes.id, this.typing);
					this.timeout = setTimeout(this.timeoutFunction, 3000, this);
				} else {
					clearTimeout(this.timeout);
					this.timeout = setTimeout(this.timeoutFunction, 3000, this);
				}
			}
			if (e.ctrlKey) {
				if (e.which != 10)
					e.preventDefault();
				else {
					$(e.currentTarget).val($(e.currentTarget).val()+'\n');
					scrollToBottom(e.currentTarget);
				}
			} else if (e.which == 13) {
				e.preventDefault();
        var message = ($(e.currentTarget).val()).trim()
        if (message !== '') {
          socket.emit('message', this.model.attributes.id, $(e.currentTarget).val(), function() {});
          $(e.currentTarget).val('');
        }
			}
      console.log("send message backbone");
		},
		closeChat: function() {
			this.close();
      $("#chat .list, #chat .search").show();
		}
	});

	app.ContactsListView = Backbone.View.extend({
		el: '.contact-list',
		events: {
			'click div.user': 'openChat'
		},
		initialize: function() {
			var that = this;
			this.collection = {};
			socket.on('new_message', function(from, data) {
				if ($("div.chat[user='"+from.id+"']").length == 0) {
					app.chats[id] = new app.ContactView({
						id: from.id,
						name: from.name
					});
				} else
					pushMessage($("div.chat[user='"+from.id+"']").find("div.conversation"), from.toString() != data.me.toString(), data.msg, (data.state != undefined ? !data.state : false));
			});

			socket.on('update_status', function(id, state) {
				console.log('status',id,state);
				that.$el.find("[uid='"+id+"'] .state").removeClass(state ? 'off' : 'on').addClass(state ? 'on' : 'off');
			});
		},
		openChat: function(list) {
			var id = $(list.currentTarget).attr('uid');

			if ($("div.chat[user='"+id+"']").length == 0) {
				if (app.chats[id] == undefined)
					app.chats[id] = new app.ContactView({
						id: id,
						name: $(list.currentTarget).find('span.name').text()
					});
				else
					app.chats[id].render();
			} else {
				$("div.chat[user='"+id+"'] textarea").focus();
			}
			return this;
		}
	});

	app.ContactsList = new app.ContactsListView();

	var getConversation = function(id, page) {
		socket.emit('conversation', id, page);
	}

	socket.on('disconnect', function() {
		console.log('Disconnected !');
		console.log(socket.io._reconnectionDelayMax);
	});

	$("div.chat textarea").on('keypress', function(e) {
		if (e.keyCode == 13) {
			e.preventDefault();
			if (this.value.length > 0) {
				var data;
				data = $(this).val();
				$(this).val('');
				return sendMessage($(this).parent().parent().attr('user'), data);
			}
		}
	});

	$("#chat .contact-list input#chat-search").on('keyup', function(e) {
		var self = this;
		if (e.which === 27)
			$(this).val('');
		var regex = new RegExp(""+$(this).val()+"", "i");
		var opened = false;
		$.each($("#chat .contact-list .list .user"), function(key, val) {
			if (e.which === 13 && $(self).val().length && regex.exec($(val).find('.name').html())) {
				opened = true;
				$(val).trigger('click');
			}
			regex.exec($(val).find('.name').html()) === null && !opened ? $(val).hide() : $(val).show();
		});
		if (opened) {
			opened = false;
			$(this).val('');
		}
	});

});
