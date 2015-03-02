(function() {
  'use strict';

  app = app || {};

  app.Report = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      reportId: '',
      type: '',
      category: '',
      comments: ''
    },
    url: function() {
      return '/admin/reports/'+ this.id +'/';
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = new app.Report();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.Details = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      reportId: '',
      from: '',
      to: '',
      type: '',
      category: '',
      comments: ''
    },
    url: function() {
      return '/admin/reports/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.report) {
        app.mainView.model.set(response.report);
        delete response.report;
      }
      return response;
    }
  });

  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
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
        reportId: app.mainView.model.get('reportId'),
        from: app.mainView.model.get('from'),
        to: app.mainView.model.get('to'),
        type: app.mainView.model.get('type'),
        category: app.mainView.model.get('category'),
        comments: app.mainView.model.get('comments')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
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
      return '/admin/reports/'+ app.mainView.model.id +'/';
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
              location.href = '/admin/reports/';
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
      console.log("ID: " + this.id);
      this.model = new app.Report( JSON.parse( unescape($('#data-results').html()) ) );
      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
    }
  });
  app.mainView = new app.MainView();
}());
