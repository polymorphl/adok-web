(function() {
  'use strict';

  app = app || {};

  app.ItemModel = Backbone.Model.extend({
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

  app.ItemView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    initialize: function(item) {
      this.model = new app.ItemModel();
      console.log(item);
      this.model.set(item);
      if (item.uid.hasOwnProperty('facebook')) 
        this.model.attributes.name = item.uid.facebook.name;
      else
        this.model.attributes.name = item.uid.username;
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
    initialize: function(item) {
      this.model = new app.ItemModel();
      console.log(item);
      this.model.set(item);
      if (item.uid.hasOwnProperty('facebook')) 
        this.model.attributes.name = item.uid.facebook.name;
      else
        this.model.attributes.name = item.uid.username;
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
            console.log(res);
            alert("Vous validez cette proposition.");
            location.href = '/event/' + res.eid + '/validation';
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
            location.href = '/event/' + res.eid + '/validation';
          } else {
            alert("Vous avez déjà refusé cette proposition.");
          }
        },
        error: function(err) {
          alert(err);
          alert("ERROR");
        }
      });
    }
  });


  $(document).ready(function(){

  	var val = JSON.parse( unescape($('#data-row').html()) );
    console.log("val", val);

    app.Item = new app.ItemView(val);
    app.Actions = new app.ActionsView(val);
  });

}());
