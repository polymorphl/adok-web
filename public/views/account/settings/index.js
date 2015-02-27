/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Account = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });

  app.User = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/account/settings/'
  });

  app.Identity = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      username: '',
      email: ''
    },
    url: '/account/settings/identity/',
    parse: function(response) {
      if (response.user) {
        app.mainView.user.set(response.user);
        delete response.user;
      }

      return response;
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
      return '/account/settings/delete/';
    }
  });

  app.IdentityView = Backbone.View.extend({
    el: '#identity',
    template: _.template( $('#tmpl-identity').html() ),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Identity();
      this.syncUp();
      this.listenTo(app.mainView.user, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.user.id,
        username: app.mainView.user.get('username'),
        email: app.mainView.user.get('email')
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
        username: this.$el.find('[name="username"]').val(),
        email: this.$el.find('[name="email"]').val()
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
      this.model = new app.Delete({ _id: app.mainView.account.id });
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
              location.href = '/';
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
      this.account = new app.Account( JSON.parse( unescape($('#data-account').html()) ) );
      this.user = new app.User( JSON.parse( unescape($('#data-user').html()) ) );

      app.identityView = new app.IdentityView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
    
    $(".alert .close").on("click", function(e){
      e.preventDefault();
      $(this).remove();
    });
  });
}());
