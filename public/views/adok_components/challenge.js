/**
*
* Proposer Js public
*
**/

(function() {
	'use strict';

	var app = app || {};

	function updateDoubleDate(el, range) {
		el.attr('v1', moment(moment().unix()*1000).format("YYYY-MM-DD"));
		el.attr('v2', moment(moment().add(1, 'M').unix()*1000).format("YYYY-MM-DD"));
		jQuery(range).slider({
	  	range: true,
	    min: moment().unix()*1000,
	    max: moment().add(1, 'M').unix()*1000,
	    step: 86400000,
	    values: [ moment().unix()*1000, moment().add(1, 'M').unix()*1000 ],
	    slide: function( event, ui ) {
	    	var day1 = moment(ui.values[0]).toDate();
	    	var day2 = moment(ui.values[1]).toDate();
	    	var d1 = moment(day1).format("DD/MM");
	    	var d2 = moment(day2).format("DD/MM");
				jQuery(el).attr('v1', moment(day1).format("YYYY-MM-DD"));
				jQuery(el).attr('v2', moment(day2).format("YYYY-MM-DD"));
	      jQuery(el).val( d1 + " " + d2 );
	  		// FORMAT : DD-MM DD-MM
	    }
		});
	}

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
			minLength: 10,
			select: function(e, ui) {
				that.$el.find('[name="place_value"]')[0].value = ui.item.label;
				that.$el.find('[name="place_Lat"]')[0].value = ui.item.lat;
				that.$el.find('[name="place_Lng"]')[0].value = ui.item.lng;
			}
		});
	}

	app.invitationData = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			uid: '',
			pic: '',
			name: ''
		}
	});

	app.invitationView = Backbone.View.extend({
		el: '#privacy ul.container-ptc',
		template: _.template( $('#tmpl-invitation_item').html() ),
		initialize: function(obj) {
			this.model = new app.invitationData();
			this.model.set(obj);
			this.render();
		},
		render: function() {
			this.$el.append(this.template(this.model.attributes));
			return this;
		}
	});

	function autocomplete_friends(that) {
		that.selectedUsers = new Array();
		that.invitationList = new Array();
		function get_friendlist(regex) {
			return $.map($("#chat .list > div.user"), function(friend) {
				if (regex.exec($(friend).find('.name').text()) && !!~($.inArray($(friend).attr('uid'), that.selectedUsers)) === false) {
					return {
						label: $(friend).find('.name').text(),
						value: $(friend).attr('uid'),
						pic: $(friend).find('img').attr('src')
					};
				} else
					return null;
			});
		}
		that.$el.find('[name="ptc_list"]').autocomplete({
			source: function(req, res) {
				var regex = new RegExp(""+that.$el.find('[name="ptc_list"]').val()+"", "i");
				res(get_friendlist(regex));
			},
			minLength: 1,
			select: function(e, ui) {
				that.invitationList.push(new app.invitationView({ uid: ui.item.value, pic: ui.item.pic, name: ui.item.label }));
				that.selectedUsers.push(ui.item.value);
				e.preventDefault();
				that.$el.find('[name="ptc_list"]').val('');
			}
		});
	}

	Backbone.View.prototype.close = function () {
		this.stopListening();
		this.$el.children().remove();
		return this;
	};

	app.EventData = Backbone.Model.extend({
		url: '/propose',
		defaults: {
			errors: [],
			errfor: {},
			type: 'act',
			category: '',
			title: '',
			date0: '',
			date1: '',
			hashtag: '',
			place: '',
			place_value: '',
			place_Lat: '',
			place_Lng: '',
			desc: '',
			visibility: 10,
			toNotif: [],
			photo: {}
		}
	});

	app.ProposeEvent = Backbone.View.extend({
		el: '#propose ol.fs-fields',
		template: _.template($('#tmpl-event').html()),
		events: {
			'submit form': 'preventSubmit'
		},
		initialize: function() {
			this.model = new app.EventData();
			this.render();
		},
		render: function() {
			var that = this;
			this.$el.append(this.template(this.model.attributes));
			updateDoubleDate($('[name="dateCtrl"]'), $('#rangeCtrld0'));
			autocomplete(this);
			autocomplete_friends(this);
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		propose: function() {
			this.model.save({
				category: 0,
				title: this.$el.find("[name='title']").val(),
				desc: this.$el.find("[name='desc']").val(),
				date0: moment(this.$el.find("[name='dateCtrl']").attr('v1')),
				date1: moment(this.$el.find("[name='dateCtrl']").attr('v2')),
				hashtag: this.$el.find("[name='hashtag']").val(),
				place: this.$el.find("[name='place']").val(),
				place_value: this.$el.find("[name='place_value']").val(),
				place_Lat: this.$el.find("[name='place_Lat']").val(),
				place_Lng: this.$el.find("[name='place_Lng']").val(),
				visibility: this.$el.find("[name='km']").val(),
				toNotif: $.map(this.$el.find("ul.container-ptc > li"), function(item) {
					return $(item).attr('userid');
				})
			},{
				success: function(model, response) {
					if (response.success) {
						location.href = '/event/activity/'+response.event._id;
					} else
						model.set(response);
				}
			});
		}
	});

	app.Propose = Backbone.View.extend({
		el: '#propose',
		events: {
			'click .return': 'reset',
			'click .fs-submit': 'propose'
		},
		initialize: function() {
			this.BackboneForm = new app.ProposeEvent();
			this.$el.find('ul li').removeClass('fs-current').addClass('fs-hide').removeClass('fs-hide');
			var that = this;
			this.FForm = this.FForm = new FForm(document.getElementById('propose_wrap'), {onReview: function() { that.BackboneForm.propose(); return false; }});
			return this;
		},
		reset: function() {
			if (this.BackboneForm) {
				this.$el.find('ul li').addClass('fs-current');
				delete this.BackboneForm.close();
				this.BackboneForm = new app.ProposeEvent();
			}
			if (this.FForm) {
				delete this.FForm.destroy();
				var that = this;
				this.FForm = this.FForm = new FForm(document.getElementById('propose_wrap'), {onReview: function() { that.BackboneForm.propose(); return false; }});
			}
			return this;
		},
		propose: function(event) {
			event.preventDefault();
			this.BackboneForm.propose();
			return this;
		}
	});

	app.ProposeForm = new app.Propose();

	/*-----  Propose  ------*/
	var t_prop = $('#t_propose');
	var m_prop = $('#propose');
	var m_close = $('#propose .modal__header .close, .box-overlay');
	var overlay = $('.box-overlay');

	t_prop.on('click', function(e){
		e.preventDefault();
		e.stopPropagation();
		$('body').removeClass('with--sidebar');
		overlay.addClass("is-active");
		m_prop.hide().velocity('transition.fadeIn', { }).addClass('is-open');
	});

	m_close.on('click', function(e) {
		$(this).addClass('is-open');
		e.preventDefault();
		overlay.removeClass("is-active");
		m_prop.velocity('transition.fadeOut', { }).removeClass('is-open');
		app.ProposeForm.reset();
	});
}());

