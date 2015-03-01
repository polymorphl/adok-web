(function() {
  'use strict';

  app = app || {};

  app.FluxValidationModel = Backbone.Model.extend({
    idAttribute: '_id',
  	defaults: {
  		epicture: '',
  		eusername: ''
  	}
  });

  app.LegendModel = Backbone.Model.extend({
    idAttribute: '_id',
  	defaults: {
  		legend: ''
  	}
  });

  app.CommentModel = Backbone.Model.extend({
    idAttribute: '_id',
  	defaults: {
  		cpicture: '',
  		cusername: '',
  		comment: ''
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
      this.model.set(item);
  		console.log("flux validation ok");
  		this.render();
  	},
  	visualizer: function(e) {
  		console.log("visualizer ok");
  	},
  	render: function() {
      this.$el.html(this.template( this.model.attributes ));
      console.log("valiflu render ok");
  	}
  });

  app.LegendView = Backbone.View.extend({
  	el: '#legend',
    template: _.template( $('#tmpl-legend').html() ),
  	initialize: function(item) {
  		this.model = new app.LegendModel();
      this.model.set(item);
  		console.log("legend ok");
  		this.render();
  	},
  	render: function() {
      this.$el.html(this.template( this.model.attributes ));
  		console.log("legend render ok");
  	}
  });

  app.CommentView = Backbone.View.extend({
  	el: '#comment',
    template: _.template( $('#tmpl-comment').html() ),
  	initialize: function(item) {
  		this.model = new app.CommentModel();
      this.model.set(item);
  		console.log("comment ok");
  		this.render();
  	},
  	render: function() {
      this.$el.html(this.template( this.model.attributes ));
  		console.log("comment render ok");
  	}
  });

  $(document).ready(function(){
  	app.FluxValidation = new app.FluxValidationView(JSON.parse( unescape($('#data-valiflux').html()) ));
  	app.Legend = new app.LegendView(JSON.parse( unescape($('#data-legend').html()) ));
  	app.Comment = new app.CommentView(JSON.parse( unescape($('#data-comment').html()) ));
  });

}());
