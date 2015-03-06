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

  app.ActionsView = Backbone.View.extend({
    el: "#actions",
    events: {
      'click #btn-valid': 'validate',
      'click #btn-refuse': 'refuse'
    },
    validate: function() {
      $.ajax({
        url: document.URL + '/validate',
        type: 'GET',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            alert("Vous validez cette proposition.");
          } else {
            alert("Vous avez déjà validé cette proposition.");
          }
        },
        error: function(err) {
          alert("ERROR");
        }
      });
    },
    refuse: function() {
      $.ajax({
        url: document.URL + '/refuse',
        type: 'GET',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            alert("Vous refusez cette proposition.");
          } else {
            alert("Vous avez déjà refusé cette proposition.");
          }
        },
        error: function(err) {
          alert("ERROR");
        }
      });
    }
  });


  $(document).ready(function(){

  	var val = JSON.parse( unescape($('#data-row').html()) );

    app.Item = new app.ItemView(val);
    app.Actions = new app.ActionsView();
  });

}());
