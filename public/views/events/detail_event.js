(function() {
	'use strict';

  app = app || {};
	var socket = null;
	var idEvent = document.URL.split("/")[document.URL.split("/").length - 1];
	var type = document.URL.split("/")[document.URL.split("/").length - 2].split("/")[0];

  app.ownerActions = Backbone.View.extend({
    el: $('form'),

    initialize: function() {
      this.render();
    },
    render: function() {
      //this.loadComment();
    }
  });

	/*   FOR DATAS   */

	function autocomplete(that) {
		that.$el.find('[name="place"]').autocomplete({
			source: function(req, res) {
				that.$el.find('[name="place_value"]')[0].value = '';
				that.$el.find('[name="place_Lat"]')[0].value = '';
				that.$el.find('[name="place_Lng"]')[0].value = '';
				$.post('/geocode/', {
						query: that.$el.find('[name="place"]').val()
					}).done(function(data) {
						res($.map(data, function(item) {
							console.log(item);
							return {
								label: item.addr,
								value: item.addr,
								lat: item.latlng.lat,
								lng: item.latlng.lng
							};
						}));
					}).fail(function() {
						console.log('ERROR');
					});
			},
			minLength: 5,
			select: function(e, ui) {
				that.$el.find('[name="place_value"]')[0].value = ui.item.label;
				that.$el.find('[name="place_Lat"]')[0].value = ui.item.lat;
				that.$el.find('[name="place_Lng"]')[0].value = ui.item.lng;
			}
		});
	}

	app.LeftDataModel = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			date: '',
			emonth: '',
			eday: '',
			photos: ''
		}
	});

	app.LeftDataView = Backbone.View.extend({
		el: ".left",
		template: _.template( $('#tmpl-left').html()),
		initialize: function(item) {
			moment.localeData("fr");
			var base = moment(item.date);
			this.model = new app.LeftDataModel();
			item.emonth = base.format("MMMM");
			item.eday = base.format("DD");
			this.model.set(item);
			this.render();
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		}
	});

	app.RightDataModel = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			eid: '',
			uid: ''
		},
		url: function() {
			return ("/event/ownerActions/"+this.id+"/delete");
		}
	});

	app.RightDataView = Backbone.View.extend({
		el: ".right",
		template: _.template( $('#tmpl-right').html()),
		events: {
			'click #t_prop_edit': 'bar_edit'
		},
		initialize: function(item) {
			var cattab = ["hobby", "activity", "sport"];
			item.ncategory = cattab[item.category];
			item.eid = item._id;
			item.uid = item.acc._id;
			this.model = new app.RightDataModel();
			this.model.set(item);
			// this.bar_edit({preventDefault: function(){return 0;}});
			this.render();
		},
		bar_edit: function(e) {
			e.preventDefault();
			$('body').removeClass('with--sidebar');
			$('#prop_edit').velocity('transition.slideLeftIn', { duration: 300 }).removeClass('is-close');
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		}
	});

	app.DeleteEventView = Backbone.View.extend({
		el: ".delete_proposal, #delete_prop",
		events: {
			'click #t_delete_prop': 'delete',
			'click .close': 'close_delete',
			'click .btn-no': 'close_delete',
			'click .btn-yes': 'yes_delete'
		},
		initialize: function(item) {
			item.eid = item._id;
			item.uid = item.acc._id;
			this.model = new app.RightDataModel();
			this.model.set(item);
			this.t_delprop = $('#t_delete_prop');
			this.m_delprop = $('#delete_prop');
			this.m_fclose = $('#delete_prop .modal__header .close, .box-overlay');
			this.overlay = $('.box-overlay');
		},
		yes_delete: function(e) {
			e.preventDefault();
      this.model.destroy({
      	headers: {
      		eid: this.model.attributes.eid,
      		uid: this.model.attributes.uid
      	},
        success: function(model, response) {
          if (response.success) {
          	alert("L'évênement à bien été supprimé.");
          	location.href = "/account/";
          }
          else {
          	alert("Une erreur est survenue.");
          }
        }
      });
		},
		close_delete: function(e) {
			e.preventDefault();
			$(this).addClass('is-open');
			e.preventDefault();
			this.overlay.removeClass("is-active");
			$("body").removeClass("modal-open");
			this.m_delprop.velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
		},
		delete: function(e) {
			e.preventDefault();
			e.stopPropagation();
			$('body').removeClass('with--sidebar');
			this.overlay.addClass("is-active");
			$("body").addClass("modal-open");
			this.m_delprop.hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
		}
	});

	app.JoinEventModel = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			eid: '',
			uid: ''
		},
		url: function() {
			return ("/event/ownerActions/"+this.id+"/join");
		}
	});

	app.JoinEventView = Backbone.View.extend({
		el: '.join_proposal, .left_proposal',
		events: {
			'click #t_prop_join': 'join_event',
			'click #t_prop_left': 'join_event'
		},
		initialize: function(item) {
			if (item.isRegistered == "true") {
				$(".join_proposal").hide();
				$(".left_proposal").show();
				$(".waiting_proposal").hide();
			} else if (item.isRegistered == "false") {
				$(".join_proposal").show();
				$(".left_proposal").hide();
				$(".waiting_proposal").hide();
			} else if (item.isRegistered == "pending") {
				$(".join_proposal").hide();
				$(".left_proposal").hide();
				$(".waiting_proposal").show();
			}
			item.eid = item._id;
			item.uid = item.acc._id;
			this.id = item.eid;
			this.model = new app.JoinEventModel();
			this.model.set(item);
		},
		join_event: function(e) {
			e.preventDefault();
			this.model.save({}, {
        success: function(model, response) {
          if (response.success) {
          	if ($(".join_proposal").is(":visible")) {
	          	alert("Vous avez rejoins l'évênement, cependant il faut attendre la confirmation du créateur.");
          	}
          	else if ($(".left_proposal").is(":visible")) {
	          	alert("Vous ne faites plus parti de cette évênement.");
          	}
	          else {
	          	alert("Une erreur est survenue.");
	          }
           	location.href = "/event/activity/"+model.id;
          }
          else {
          	alert("Une erreur est survenue.");
          }
        }
			});
		}
	});

	app.EditDataModel = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			id: '',
			date: '',
			desc: '',
			title: '',
			latLng: ['', ''],
			hashtag: '',
			place: '',
			numOfPtc: '',
			eyear: '',
			emonth: '',
			eday: '',
		},
		url: function() {
			return ("/event/activity/"+this.id+"/edit");
		}
	});

	app.ValidEditView = Backbone.View.extend({
		el: "#prop_edit, #editd_prop, .actions",
		events: {
			'click #t_editd_prop': 'validation',
			'click .close': 'close_edit_p'
		},
		initialize: function(item) {
			moment.localeData('fr');
			var base = moment(item.date);
			var base1 = moment(item.date2);
			item.date = moment(base).format("YYYY-MM-DD");
			item.eyear = moment(base).format("YYYY");
			item.emonth = moment(base).format("MMMM");
			item.eday = base.format("DD");
			item.date2 = moment(base1).format("YYYY-MM-DD");
			item.eyear1 = base1.format("YYYY");
			item.emonth1 = base1.format("MMM");
			item.eday1 = base1.format("DD");
			this.id = item._id;
			this.model = new app.EditDataModel();
			this.model.set(item);
		},
		close_edit_p: function(e) {
			$('#edited_prop .modal__header .close, .box-overlay').addClass('is-open');
			e.preventDefault();
			$('.box-overlay').removeClass("is-active");
			$("body").removeClass("modal-open");
			$('#editd_prop').velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
			location.href = "/event/activity/"+this.id;
		},
		validation: function(e) {
			e.preventDefault();
			e.stopPropagation();
			this.model.save({
				id: this.id,
				year: this.$el.find('[name="date"]').val().split("-")[0],
				month: this.$el.find('[name="date"]').val().split("-")[1],
				day: this.$el.find('[name="date"]').val().split("-")[2],
				year1: this.$el.find('[name="date1"]').val().split("-")[0],
				month1: this.$el.find('[name="date1"]').val().split("-")[1],
				day1: this.$el.find('[name="date1"]').val().split("-")[2],
				title: this.$el.find('[name="title"]').val(),
				desc: this.$el.find('[name="desc"]').val(),
				hashtag: this.$el.find('[name="hashtag"]').val(),
				place: this.$el.find('[name="place"]').val(),
				numOfPtc: this.$el.find('[name="numOfPtc"]').val()
			}, {
				success: function(model, response) {
					if (response.success) {
						$('body').removeClass('with--sidebar');
						$('#prop_edit').addClass('is-close');
						$('.box-overlay').addClass("is-active");
						$("body").addClass("modal-open");
						$('#editd_prop').hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
					} else {
							alert("Une erreur est survenue.");
							console.log(model);
							console.log(response);
					}
				},
				error: function(model, response) {
					console.log("Une erreur est survenue.");
					console.log(model);
					console.log(response);
				}
			});
		}
	});

	app.EditDataView = Backbone.View.extend({
		el: "#prop_edit",
		template: _.template( $('#tmpl-edit-event').html()),
		events: {
			'click #t_prop_close': 'close_edit',
			'click .refresh': 'refresh_data'
		},
		initialize: function(item) {
			moment.localeData('fr');
			var base = moment(item.date);
			var base1 = moment(item.date2);
			item.date = moment(base).format("YYYY-MM-DD");
			item.eyear = moment(base).format("YYYY");
			item.emonth = moment(base).format("MMMM");
			item.eday = base.format("DD");
			item.date2 = moment(base1).format("YYYY-MM-DD");
			item.eyear1 = base1.format("YYYY");
			item.emonth1 = base1.format("MMM");
			item.eday1 = base1.format("DD");
			this.id = item._id;
			this.model = new app.EditDataModel();
			this.model.set(item);
			this.render();
			this.refresh_data();
			autocomplete(this);
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
			return this;
		},
		refresh_data: function() {
			$('input[name="date"]').val(this.model.attributes.date);
			$('input[name="date1"]').val(this.model.attributes.date2);
			$('input[name="year"]').val(this.model.attributes.eyear);
			$('input[name="month"]').val(this.model.attributes.emonth);
			$('input[name="day"]').val(this.model.attributes.eday);
			$('input[name="year1"]').val(this.model.attributes.eyear1);
			$('input[name="month1"]').val(this.model.attributes.emonth1);
			$('input[name="day1"]').val(this.model.attributes.eday1);
			$('input[name="title"]').val(this.model.attributes.title);
			$('input[name="desc"]').val(this.model.attributes.desc);
			$('input[name="place"]').val(this.model.attributes.place);
			$('input[name="hashtag"]').val(this.model.attributes.hashtag);
			$('input[name="numOfPtc"]').val(this.model.attributes.numOfPtc);
		},
		close_edit: function(e) {
			e.preventDefault();
			$('#prop_edit').velocity('transition.slideLeftOut').addClass('is-close');
		}
	});

	var sendNewComment = function() {
		console.log("add new comment");
		if (socket === null) {return;}
		var contentCommentValue = document.getElementById('commentTextaera').value;
		document.getElementById('commentTextaera').value = "";
		if (contentCommentValue.length > 0) {
			socket.emit("addComment", {'eventid':idEvent, 'typeevent':type, 'comment':contentCommentValue});
		}
	};

  $(document).ready(function() {
    app.Actions = new app.ownerActions();
    socket = io.connect("http://localhost/comment", {'secure': true});

    socket.on('connect', function(socketClient) {
      socket.emit('idevent', {'eventid':idEvent, 'typeevent':type});
      socket.on('comment', function(comments) {

        var bodyContentComment = "";
        comments.forEach(function(currentComment, index, array) {
          bodyContentComment += "<li><div class='username'>" + currentComment.user + "  " + currentComment.time;
          bodyContentComment += "<img src='"+ currentComment.picture +"'/></div><div class='comment'>" + currentComment.comment + "</div></li>";
        });
        $('#listComment').html(bodyContentComment);

      });
    });

		$(document).on ("click", "#buttonAddComment", function () {
			sendNewComment();
		});

    var eventData = JSON.parse(unescape( $("#event-results").html() ));
    eventData.isRegistered = $("#event-reg").html() + "";
		new app.LeftDataView(eventData);
		new app.RightDataView(eventData);
		new app.EditDataView(eventData);
		new app.JoinEventView(eventData);
		new app.DeleteEventView(eventData);
		new app.ValidEditView(eventData);

    var map = L.mapbox.map('map-event', 'lucterracherwizzem.kp9oc66l', {
    	minZoom: 5, maxZoom: 19,
    	accessToken: 'pk.eyJ1IjoicG9seW1vcnBobCIsImEiOiJaTWFpLWI4In0.cPiDB1qRwLUFGWmBRhZinA', //public token for v2.x
    	infoControl: false
    });

    map.zoomControl.setPosition('topright');
    var e_lat = $('.elat').val();
    var e_lng = $('.elng').val();
    var homeIcon = L.icon({
			iconUrl: "/medias/map-marker/mrk.png",
			iconSize: [80, 80]
		});
    var marker = new L.Marker([e_lat, e_lng]);
		marker.setIcon(homeIcon);
		marker.addTo(map);
    map.setView([e_lat, e_lng], 14);

  });
}());
