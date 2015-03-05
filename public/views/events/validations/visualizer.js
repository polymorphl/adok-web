(function() {
  'use strict';

  app = app || {};

  app.ItemModel = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: '',
      e: '',
      picture: '',
      acc: ''
    }
  });

  app.ItemView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    initialize: function(item) {
      this.model = new app.ItemModel();
      this.model.set(item);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  $(document).ready(function(){

  	var val = JSON.parse( unescape($('#data-row').html()) );
    app.Item = new app.ItemView(val);
    console.log(val);
  });

}());
