/**
*
* Proposer Js public
*
**/

(function() {
	'use strict';

	var app = app || {};

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
			title: '',
			hashtag: '',
			place: '',
			place_value: '',
			place_Lat: '',
			place_Lng: '',
			desc: '',
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
			autocomplete(this);
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		propose: function() {
			this.model.save({
				title: this.$el.find("[name='title']").val(),
				desc: this.$el.find("[name='desc']").val(),
				hashtag: this.$el.find("[name='hashtag']").val(),
				place: this.$el.find("[name='place']").val(),
				place_value: this.$el.find("[name='place_value']").val(),
				place_Lat: this.$el.find("[name='place_Lat']").val(),
				place_Lng: this.$el.find("[name='place_Lng']").val(),
				toNotif: $.map(this.$el.find("ul.container-ptc > li"), function(item) {
					return $(item).attr('userid');
				})
			},{
				success: function(model, response) {
					if (response.success) {
						location.href = '/event/'+response.event._id;
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

