/**
*
* Notifications
* Edition Wizzem 2014
*
**/

/* global app:true */
/* exported app */

var app;
var idLastNotif = '000000000000000000000000';

(function() {
	'use strict';

	$(document).ready(function() {
		var socket = io.connect(websocketUrl + 'notification', {secure: true});
		socket.on("connection", function(socket) {
			console.log("Connection socket notification");
		});
		socket.on("notification", function(alert) {
			if (alert.type == 0) {
				var n = noty({
					text        : alert.notificationContent.content.nameUser  + alert.msg + alert.title,
					type        : 'alert',
					dismissQueue: false,
					layout      : 'topRight',
					theme       : 'defaultTheme'});
			}
			else if (alert.type == 1) {
				var n = noty({
					text        : alert.notificationContent.content.nameUser  + alert.msg + alert.title,
					type        : 'alert',
					dismissQueue: false,
					layout      : 'topRight',
					theme       : 'defaultTheme'});
			}
			else if (alert.type == 2) {
				var n = noty({
					text        :  alert.notificationContent.content.nameUser  + alert.msg,
					type        : 'alert',
					dismissQueue: false,
					layout      : 'topRight',
					theme       : 'defaultTheme',
					buttons     : [{
						addClass: 'btn btn-primary', text: 'Accepter', onClick: function ($noty) {
							$.post('/feed/follow/accept', {
								uid: alert.notificationContent.to,
								type: 'account',
								nid: alert.notificationContent.from,
							});
							$noty.close();
						}
					},
				{
					addClass: 'btn btn-danger', text: 'Refuser', onClick: function ($noty) {
						$.post('/feed/follow/deny', {
							uid: alert.notificationContent.to,
							type: 'account',
							nid: alert.notificationContent.from,
						});
						$noty.close();
					}
				}]});
		}
		else if (alert.type == 3) {

			if (alert.notificationContent.interaction) {
				var n = noty({
					text        : alert.notificationContent.content.nameUser  + alert.msg + alert.title,
					type        : 'alert',
					dismissQueue: false,
					layout      : 'topRight',
					theme       : 'defaultTheme',
					buttons     : [{
						addClass: 'btn btn-primary', text: 'Accepter', onClick: function ($noty) {
							$.post('/eventRegister/accept', {
								uid: alert.notificationContent.to,
								type: "account",
								eid: alert.notificationContent.from,
								etype: 'event',
								title: alert.title
							});
							$noty.close();
						}
					},
				{
					addClass: 'btn btn-danger', text: 'Refuser', onClick: function ($noty) {
						$.post('/eventRegister/deny', {
							uid: alert.notificationContent.to,
							type: "account",
							eid: alert.notificationContent.from,
							etype: 'event',
							title: alert.title
						});
						$noty.close();
					}
				}]
			});
		} else {
			var n = noty({
				text        : alert.notificationContent.content.nameUser  + alert.msg + alert.title,
				type        : 'alert',
				dismissQueue: false,
				layout      : 'topRight',
				theme       : 'defaultTheme'});
			}
		}
		});

		socket.on('displaynotification', function(notifs) {

			var bodyNotificationContent = "";
			notifs.forEach(function(currentNotification, index, array) {
				bodyNotificationContent += "<div class='event'><a href=" + currentNotification.link + "><div class='who'><p><span class='name'>" + currentNotification.user;
				bodyNotificationContent += "</span></p></div><div class='what'>" + currentNotification.title + "</div></a>";
				bodyNotificationContent += "<div class='action'><span class='accpet'><div class='acc'><i class='fa fa-check'/><i class='fa fa-times'/></div></span>" + "</div>";
				bodyNotificationContent += "<div class='bottom'>" + currentNotification.date + "</div></div>";

			});
			$('#notifications').html(bodyNotificationContent);
		});

		socket.on("disconnect", function() {
			console.log("deconnection notification socket");
		});


		var t_notif = $('#t_notif');
		var m_notif = $('#notifications');

		t_notif.on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
			$('body').removeClass('with--sidebar');
			if (m_notif.hasClass('is-open')) {
				m_notif.velocity('transition.bounceDownOut').removeClass('is-open');
			} else {
				socket.emit('getnotification', "notification");
				m_notif.velocity('transition.bounceDownIn').addClass('is-open');
			}
		});

	});

	//Get list of notifications at loading
	var getNotifs = function() {
		$.get('/feed', function(res) {
			if (res.success) {
				if (res.notifs[0])
					idLastNotif = res.notifs[0].id;
			} else
				console.log(res.errors[0]);
		});
	};

	//Function to update notifications feed
	var updateNotifs = function() {

		$.get('/feed/'+idLastNotif, function(res) {
			if (res.success) {
    		if (res.notifs[0]) {
    			idLastNotif = res.notifs[0].id;
					var notify = humane.create({ timeout: 4000, baseCls: 'humane' });
					notify.log(res.notifs[0].data);
				}
    	} else
    		console.log(res.errors[0]);
    });
	};
}());
