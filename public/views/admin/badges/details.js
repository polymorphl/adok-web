(function() {
  'use strict';

  app = app || {};

	app.Badge = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			name: '',
			desc: '',
			title: '',
      picture: ''
		},
		url: function() {
			return '/admin/badges/'+ (this.isNew() ? '' : this.id +'/');
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
      return '/admin/badges/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      name: '',
      desc: '',
      title: '',
      picture: ''
    },
    url: function() {
      return '/admin/badges/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.badge) {
        app.mainView.model.set(response.badge);
        delete response.badge;
      }
      return response;
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = new app.Badge();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Details();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
        name: app.mainView.model.get('name'),
        desc: app.mainView.model.get('desc'),
        title: app.mainView.model.get('title'),
        picture: app.mainView.model.get('picture')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    update: function() {
      this.model.save({
        name: this.$el.find('[name="name"]').val(),
        desc: this.$el.find('[name="desc"]').val(),
        title: this.$el.find('[name="title"]').val(),
        picture: this.$em.find('[name="picture"]').val()
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
              location.href = '/admin/badges/';
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
    el: '.page-container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.Badge( JSON.parse( unescape($('#data-results').html()) ) );
      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
    }
  });
  app.mainView = new app.MainView();
}());
