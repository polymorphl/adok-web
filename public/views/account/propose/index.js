/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.Aevent = Backbone.Model.extend({
		url: '/account/propose/activity',
		defaults: {
			errors: [],
			errfor: {},
			category: '',
			title: '',
			date: moment().add(10, 'minutes').toDate(),
			time: moment(moment().add(10, 'minutes')).format('HH:mm'),
			place_value: '',
			place_Lat: '',
			place_Lng: '',
			place: '',
			price: '0',
			numOfPtc: '',
			photos: '',
			desc: ''
		}
	});

	app.Eevent = Backbone.Model.extend({
		url: '/account/propose/exchange',
		defaults: {
			errors: [],
			errfor: {},
			category: '',
			title: '',
			date0: moment().add(10, 'minutes').toDate(),
			time0: moment(moment().add(10, 'minutes')).format('HH:mm'),
			date1: moment().add(1, 'days').add(10, 'minutes').toDate(),
			time1: moment(moment().add(1, 'days').add(10, 'minutes')).format('HH:mm'),
			place_value: '',
			place_Lat: '',
			place_Lng: '',
			place: '',
			price: '0',
			troque: '',
			photos: '',
			desc: ''
		}
	});

	var dateEN = {
		date: {
			previousMonth : 'Previous Month',
			nextMonth     : 'Next Month',
			months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
			weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
			weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			timeTitles    : ['Hours', 'Minutes']
		},
		format: 'MM-DD-YYYY',
		meridian: true,
		firstDay: 0
	};

	var dateFR = {
		date: {
			previousMonth : 'Mois précedent',
			nextMonth     : 'Mois suivant',
			months        : ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
			weekdays      : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
			weekdaysShort : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
			timeTitles    : ['Heures', 'Minutes']
		},
		format: 'DD-MM-YYYY',
		meridian: false,
		firstDay: 1
	};

	function getCookie(cname)
	{
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for(var i=0; i<ca.length; i++)
			{
			var c = ca[i].trim();
			if (c.indexOf(name)==0) return c.substring(name.length,c.length);
			}
		return "";
	}

	app.AeventView = Backbone.View.extend({
		el: '#propose1',
		template: _.template( $('#tmpl-propose1').html() ),
		events: {
			'submit form': 'preventSubmit',
			'click .btn-propose': 'propose'
		},
		initialize: function() {
			this.model = new app.Aevent();
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function() {
			var lng = (getCookie('i18next') == 'fr') ? (dateFR) : (dateEN);
			var that = this;

			this.$el.html(this.template( this.model.attributes ));
			this.$el.find('[name="desc"]').val(this.model.attributes.desc);
			this.$el.find('[name="title"]').focus();
			this.$el.find('[name="date"]').pikaday({
				firstDay: lng.firstDay,
				format: lng.format,
				defaultDate: this.model.attributes.date,
				setDefaultDate: this.model.attributes.date,
				i18n: lng.date,
				showMeridian: lng.meridian
			});
			//this.$el.find('[name="time"]').timepicker();
			this.$el.find('[name="place"]').autocomplete({
				source: function(req, res) {
					that.$el.find('[name="place_value"]')[0].value = '';
					that.$el.find('[name="place_Lat"]')[0].value = '';
					that.$el.find('[name="place_Lng"]')[0].value = '';
					$.post('/geocode/', {
							query: that.$el.find('[name="place"]').val()
						}).done(function(data) {
							res($.map(data, function(item) {
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
				minLength: 0,
				select: function(e, ui) {
					that.$el.find('[name="place_value"]')[0].value = ui.item.label;
					that.$el.find('[name="place_Lat"]')[0].value = ui.item.lat;
					that.$el.find('[name="place_Lng"]')[0].value = ui.item.lng;
				}
			});
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		propose: function() {
			this.$el.find('.btn-npropose').attr('disabled', true);

			this.model.save({
				category: this.$el.find('[name="category"]').val(),
				title: this.$el.find('[name="title"]').val(),
				date: this.$el.find('[name="date"]').val(),
				time: this.$el.find('[name="time"]').val(),
				place: this.$el.find('[name="place"]').val(),
				place_value: this.$el.find('[name="place_value"]').val(),
				place_Lng: this.$el.find('[name="place_Lng"]').val(),
				place_Lat: this.$el.find('[name="place_Lat"]').val(),
				price: this.$el.find('[name="price"]').val(),
				numOfPtc: this.$el.find('[name="numOfPtc"]').val(),
				photos: '',
				desc: this.$el.find('[name="desc"]').val()
			},{
				success: function(model, response) {
					if (response.success) {
						var data = new FormData();
						var filesList = document.getElementById('files');
						if (filesList.files.length > 0) {
							for (var i = 0; i < filesList.files.length; i ++) {
								data.append('file', filesList.files[i]);
							}
							data.append('id', response.event._id);
							data.append('type', 'aevent');
							$.ajax({
								url: '/upload/image/event',
								type: 'POST',
								data: data,
								cache: false,
								contentType: false,
								processData: false,
								async: true,
								success: function(res) {
									if (!res.success) {
										alert(res.errors[0]);
									}
									var returnUrl = app.AeventView.$el.find('[name="returnUrl"]').val();
									if (returnUrl === '/account/') {
										returnUrl = response.defaultReturnUrl;
									}
									// location.href = returnUrl;
									location.href = '/event/activity/'+response.event._id;
								},
								error: function(err) {
									console.log(err);
								}
							});
						} else {
							var returnUrl = app.AeventView.$el.find('[name="returnUrl"]').val();
							// location.href = returnUrl;
							location.href = '/event/activity/'+response.event._id;
						}
					}
					else {
						model.set(response);
					}
				}
			});
		}
	});

	app.EeventView = Backbone.View.extend({
		 el: '#propose2',
		template: _.template( $('#tmpl-propose2').html() ),
		events: {
			'submit form': 'preventSubmit',
			'click .btn-propose': 'propose',
			'change [name="troque"]': 'troque'
		},
		initialize: function() {
			this.model = new app.Eevent();
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		troque: function() {
			var troque = this.$el.find('[name="troque"]');
			if (troque.val() == 'checked')
				troque.val('');
			else
				troque.val('checked');
		},
		render: function() {
			var lng = (getCookie('i18next') == 'fr') ? (dateFR) : (dateEN);
			var that = this;

			this.$el.html(this.template( this.model.attributes ));
			if (this.$el.find('[name="troque"]').val() == 'checked')
				this.$el.find('[name="troque"]').prop('checked', true);
			this.$el.find('[name="desc"]').val(this.model.attributes.desc);
			this.$el.find('[name="title"]').focus();
			this.$el.find('[name="date0"]').pikaday({
				firstDay: lng.firstDay,
				format: lng.format,
				defaultDate: this.model.attributes.date0,
				setDefaultDate: this.model.attributes.date0,
				i18n: lng.date,
				showMeridian: lng.meridian
			});
			//this.$el.find('[name="time0"]').timepicker();
			this.$el.find('[name="date1"]').pikaday({
				firstDay: lng.firstDay,
				format: lng.format,
				defaultDate: this.model.attributes.date1,
				setDefaultDate: this.model.attributes.date1,
				i18n: lng.date,
				showMeridian: lng.meridian
			});
			//this.$el.find('[name="time1"]').timepicker();
			this.$el.find('[name="place"]').autocomplete({
				source: function(req, res) {
					that.$el.find('[name="place_value"]')[0].value = '';
					that.$el.find('[name="place_Lat"]')[0].value = '';
					that.$el.find('[name="place_Lng"]')[0].value = '';
					$.post('/geocode/', {
							query: that.$el.find('[name="place"]').val()
						}).done(function(data) {
							res($.map(data, function(item) {
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
				minLength: 0,
				select: function(e, ui) {
					that.$el.find('[name="place_value"]')[0].value = ui.item.label;
					that.$el.find('[name="place_Lat"]')[0].value = ui.item.lat;
					that.$el.find('[name="place_Lng"]')[0].value = ui.item.lng;
				}
			});
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		propose: function() {
			this.$el.find('.btn-propose').attr('disabled', true);

			var filesList = document.getElementById('files1');
			var mendatory = (filesList.files.length > 0 ? true : false);

			this.model.save({
				category: this.$el.find('[name="category"]').val(),
				title: this.$el.find('[name="title"]').val(),
				date0: this.$el.find('[name="date0"]').val(),
				time0: this.$el.find('[name="time0"]').val(),
				date1: this.$el.find('[name="date1"]').val(),
				time1: this.$el.find('[name="time1"]').val(),
				place: this.$el.find('[name="place"]').val(),
				place_value: this.$el.find('[name="place_value"]').val(),
				place_Lng: this.$el.find('[name="place_Lng"]').val(),
				place_Lat: this.$el.find('[name="place_Lat"]').val(),
				price: this.$el.find('[name="price"]').val(),
				troque: this.$el.find('[name="troque"]').val(),
				photos: mendatory,
				desc: this.$el.find('[name="desc"]').val()
			},{
				success: function(model, response) {
					if (response.success) {
						var data = new FormData();
						var filesList = document.getElementById('files1');

						for (var i = 0; i < filesList.files.length; i ++) {
							data.append('file', filesList.files[i]);
						}
						data.append('id', response.event._id);
						data.append('type', 'eevent');
						$.ajax({
							url: '/upload/image/event',
							type: 'POST',
							data: data,
							cache: false,
							contentType: false,
							processData: false,
							async: true,
							success: function(res) {
								if (!res.success) {
									alert(res.errors[0]);
								}
								var returnUrl = app.AeventView.$el.find('[name="returnUrl"]').val();
								if (returnUrl === '/account/') {
									returnUrl = response.defaultReturnUrl;
								}
								// location.href = returnUrl;
								location.href = '/event/exchange/'+response.event._id;
							},
							error: function(err) {
								console.log(err);
							}
						});
					}
				}
			});
		}
	});

	$(document).ready(function() {
		app.AeventView = new app.AeventView();
		app.EeventView = new app.EeventView();

		/**
		*
		* Edition 2014 - JS for the tool
		*
		**/

		$()

	});
}());
