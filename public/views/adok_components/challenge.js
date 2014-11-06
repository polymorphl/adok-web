/**
*
* Proposer Js public
*
**/

(function() {
	'use strict';

	var app = app || {};

	/*-----  IntToTime for Hour input ------*/
	function IntToTime(val){
  	var hours = parseInt( val / 60 );
  	var min = val - (hours * 60);
  	var time = hours + ':' + (min < 10 ? '0' + min : min);
  	return time;
	}

	// ---> Input slider (simple) date
	function updateDate(el, range) {
		el.attr("value", moment().format("YYYY-MM-DD"));
		el.on('input', function() {
        range.prop('valueAsNumber', $.prop(this, 'valueAsNumber'));
    });
    range.on('input', function() {
        el.prop('valueAsNumber', $.prop(this, 'valueAsNumber'));
    });
	}

  // ---> Input slider (simple) hour
  function updateHour(el, range) {
		range.on("input", function(){
			var time = IntToTime($(this).val());
		el.val(time);
		});
  }

  // ---> Input slider (double) hour
  function updateDoubleHour(el, range) {
    jQuery(range).slider({
	    range: true,
	    min: 0, max: 1440,
	    step: 15, values: [ 600, 1200 ],
	    slide: function( event, ui ) {
	      var hours1 = Math.floor(ui.values[0] / 60);
	      var minutes1 = ui.values[0] - (hours1 * 60);
	      if(hours1.length < 10) hours1= '0' + hours;
	      if(minutes1.length < 10) minutes1 = '0' + minutes;
	      if(minutes1 == 0) minutes1 = '00';
	      var hours2 = Math.floor(ui.values[1] / 60);
	      var minutes2 = ui.values[1] - (hours2 * 60);
	      if(hours2.length < 10) hours2= '0' + hours;
	      if(minutes2.length < 10) minutes2 = '0' + minutes;
	      if(minutes2 == 0) minutes2 = '00';
	      jQuery(el).val(hours1+':'+minutes1+' - '+hours2+':'+minutes2 );
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
						console.log(data);
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
				console.log(ui.item);
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
			type: 'challenge',
			category: '',
			title: '',
			desc: '',
			from: moment().add(10, 'minutes').toDate(),
			fromDate: moment().add(10, 'minutes').format('DD/MM/YYYY HH:mm'),
			to: moment().add(1, 'days').add(10, 'minutes').toDate(),
			toDate: moment().add(1, 'days').add(10, 'minutes').format('DD/MM/YYYY HH:mm'),
			place: '',
			place_value: '',
			place_Lat: '',
			place_Lng: '',
			participants: 0,
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
			updateDate($('#dateCtrld0'), $('#rangeCtrld0'));
			updateDoubleHour($('#hourCtrlh0'), $('#rangeCtrlh0'));
			autocomplete(this);
		},
		preventSubmit: function(event) {
			event.preventDefault();
		}
	});

	app.Propose = Backbone.View.extend({
		el: '#propose',
		events: {
			'click .return': 'reset'
		},
		initialize: function() {
			this.BackboneForm = new app.ProposeEvent();
			this.$el.find('ol li').removeClass('fs-current').addClass('fs-hide').removeClass('fs-hide');
			this.FForm = new FForm(document.getElementById('propose_wrap'), {onReview: function() { return false; }});
			return this;
		},
		reset: function() {
			if (this.BackboneForm) {
				delete this.BackboneForm.close();
				this.BackboneForm = new app.ProposeEvent();
			}
			if (this.FForm) {
				delete this.FForm.destroy();
				this.FForm = new FForm(document.getElementById('propose_wrap'), {onReview: function() { return false; }});
			}
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
		overlay.css('visibility', 'hidden');
		m_prop.velocity('transition.fadeOut', { }).removeClass('is-open');
		app.ProposeForm.reset();
	});
}());
