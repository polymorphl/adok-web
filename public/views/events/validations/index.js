(function() {
  'use strict';

  app = app || {};

  app.FluxValidationModel = Backbone.Model.extend({
    idAttribute: '_id',
  	defaults: {
  		_id: '',
  		eid: '',
  		uid: '',
  		isValidate: false
  	}
  });

  app.LegendModel = Backbone.Model.extend({
    idAttribute: '_id',
  	defaults: {
  		legend: ''
  	}
  });

  app.FluxValidationView = Backbone.View.extend({
  	el: '#valiflux',
    template: _.template( $('#tmpl-valiflux').html() ),
  	events: {
  		'click .item': 'visualizer'
  	},
  	initialize: function(item) {
  		this.model = new app.FluxValidationModel();
      var i = 0;
      while (i < item.length) {
	      this.model.set(item[i]);
	  		this.render();
      	++i;
      }
  	},
  	visualizer: function(e) {
  	},
  	render: function() {
      this.$el.html(this.$el.html() + this.template( this.model.attributes ));
  	}
  });

  app.LegendView = Backbone.View.extend({
  	el: '#legend',
    template: _.template( $('#tmpl-legend').html() ),
  	initialize: function(item) {
  		this.model = new app.LegendModel();
  		this.render();
  	},
  	render: function() {
      // this.$el.html(this.template( this.model.attributes ));
  	}
  });

  app.ProposeView = Backbone.View.extend({
  	el: '#prop',
  	events: {
  		'click .propose': 'propose'
  	},
  	propose: function() {
  	}
  });

  $(document).ready(function(){

  	var val = JSON.parse( unescape($('#data-valiflux').html()) );
  	var i = 0;

    console.log("val", val);

  	app.FluxValidation = new app.FluxValidationView(val);
  	app.Legend = new app.LegendView(val);


		if ($(".picture").attr("src") != "")
			$("#no_result").hide();
		else
			$(".item").hide();

  });

}());
