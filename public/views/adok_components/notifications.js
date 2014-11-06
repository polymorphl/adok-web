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

	//Get Notifs
	getNotifs();
	//Set update notifications fedd interval
	setInterval(updateNotifs, 30000);
}());
