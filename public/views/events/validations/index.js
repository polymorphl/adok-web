(function() {
  'use strict';

  app = app || {};

  app.FluxValidationModel = Backbone.Model.extend({
    idAttribute: '_id',
  	defaults: {
  		_id: '',
  		eid: '',
  		uid: '',
      name: '',
      status: '',
      nbVote: {
        nbpos: 0,
        nbneg: 0
      }
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
  	initialize: function(item) {
  		this.model = new app.FluxValidationModel();
      var i = 0;
      while (i < item.length) {
 	      this.model.set(item[i]);
        if (item[i].uid.hasOwnProperty('facebook')) 
          this.model.attributes.name = item[i].uid.facebook.name;
        else
          this.model.attributes.name = item[i].uid.username;
	  		this.render();
      	++i;
      }
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

  $(document).ready(function(){

    var val = JSON.parse( unescape($('#data-valiflux').html()) );
    console.log(val);
  	var i = 0;

  	app.FluxValidation = new app.FluxValidationView(val);
  	app.Legend = new app.LegendView(val);

		if ($(".item").length > 0) 
			$("#no_result").hide();
		else
			$(".item").hide();

  });

}());
