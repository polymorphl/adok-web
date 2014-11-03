/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Event = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/admin/eevents/'+ this.id +'/';
    }
  });

  app.Delete = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/admin/eevents/'+ app.mainView.model.id +'/';
    }
  });

  app.Content = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      category: '',
      date: '',
      lat: '',
      lng: '',
      price: '',
      numOfPtc: '',
      timeCreated: '',
      desc: '',
      photos: '',
      place: '',
      title: ''
    },
    url: function() {
      return '/admin/eevents/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
      }

      return response;
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = app.mainView.model;
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.ContentView = Backbone.View.extend({
    el: '#content',
    template: _.template( $('#tmpl-content').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Content();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
        category: app.mainView.model.get('category'),
        date: app.mainView.model.get('date'),
        lat: app.mainView.model.get('lat'),
        lng: app.mainView.model.get('lng'),
        price: app.mainView.model.get('price'),
        numOfPtc: app.mainView.model.get('numOfPtc'),
        timeCreated: app.mainView.model.get('timeCreated'),
        desc: app.mainView.model.get('desc'),
        photos: app.mainView.model.get('photos'),
        place: app.mainView.model.get('place'),
        title: app.mainView.model.get('title')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      this.model.save({
        category: this.$el.find('[name="category"]').val(),
        date: this.$el.find('[name="date"]').val(),
        lat: this.$el.find('[name="lat"]').val(),
        lng: this.$el.find('[name="lng"]').val(),
        price: this.$el.find('[name="price"]').val(),
        numOfPtc: this.$el.find('[name="numOfPtc"]').val(),
        timeCreated: this.$el.find('[name="timeCreated"]').val(),
        desc: this.$el.find('[name="desc"]').val(),
        photos: this.$el.find('[name="photos"]').val(),
        place: this.$el.find('[name="place"]').val(),
        title: this.$el.find('[name="title"]').val()
      });
    }
  });

  app.DeleteView = Backbone.View.extend({
    el: '#delete',
    template: _.template( $('#tmpl-delete').html() ),
    events: {
      'click .btn-delete': 'delete',
    },
    initialize: function() {
      this.model = new app.Delete({ _id: app.mainView.model.id });
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    delete: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              location.href = '/admin/eevents/';
            }
            else {
              app.deleteView.model.set(response);
            }
          }
        });
      }
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.Event( JSON.parse( unescape($('#data-record').html())) );

      app.headerView = new app.HeaderView();
      app.contentView = new app.ContentView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
