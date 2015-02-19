/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Account = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/admin/accounts/'+ this.id +'/';
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
      return '/admin/accounts/'+ app.mainView.model.id +'/';
    }
  });

  app.Details = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      first: '',
      middle: '',
      last: ''
    },
    url: function() {
      return '/admin/accounts/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      if (response.account) {
        app.mainView.model.set(response.account);
        delete response.account;
      }

      return response;
    }
  });

  app.Login = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      id: '',
      name: '',
      newUsername: ''
    },
    url: function() {
      return '/admin/accounts/'+ app.mainView.model.id +'/user/';
    },
    parse: function(response) {
      if (response.account) {
        app.mainView.model.set(response.account);
        delete response.account;
      }

      return response;
    }
  });
  
  app.Badge = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      // _id: undefined,
      success: false,
      errors: [],
      errfor: {},
      name: ''
    },
    url: function() {
      return '/admin/accounts/'+ app.mainView.model.id + '/' + (this.isNew() ? '' : this.id);
    }
  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.Badge,
    url: '/admin/accounts/',
    parse: function(results) {
      return results.data;
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
        first: app.mainView.model.get('name').first,
        middle: app.mainView.model.get('name').middle,
        last: app.mainView.model.get('name').last
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
        first: this.$el.find('[name="first"]').val(),
        middle: this.$el.find('[name="middle"]').val(),
        last: this.$el.find('[name="last"]').val()
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
              location.href = '/admin/accounts/';
            }
            else {
              app.deleteView.model.set(response);
            }
          }
        });
      }
    }
  });

  app.LoginView = Backbone.View.extend({
    el: '#login',
    template: _.template( $('#tmpl-login').html() ),
    events: {
      'click .btn-user-open': 'userOpen',
      'click .btn-user-link': 'userLink',
      'click .btn-user-unlink': 'userUnlink'
    },
    initialize: function() {
      this.model = new app.Login();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
        id: app.mainView.model.get('user').id,
        name: app.mainView.model.get('user').name
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
    userOpen: function() {
      location.href = '/admin/users/'+ this.model.get('id') +'/';
    },
    userLink: function() {
      this.model.save({
        newUsername: $('[name="newUsername"]').val()
      });
    },
    userUnlink: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.account) {
              app.mainView.model.set(response.account);
              delete response.account;
            }

            app.loginView.model.set(response);
          }
        });
      }
    }
  });

  app.BadgeView = Backbone.View.extend({
    el: '#badge',
    template: _.template( $('#tmpl-badge').html() ),
    events: {
      'click .btn-update': 'addNew',
      'keypress input[type="text"]': 'addNewOnEnter'
    },
    initialize: function() {
      this.model = new app.Badge(this.model);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    addNewOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      event.preventDefault();
      this.addNew();
    },
    addNew: function() {
      if (this.$el.find('[name="badge"]').val() === '') {
        alert('Please enter a badge.');
      } else {
        this.model.save({
          name: this.$el.find('[name="badge"]').val(),
        },{
          success: function(model, response) {
            if (response.success) {
              app.resultView.collection.add(new app.Badge(response.badge))
              app.resultView.render();
            }
            else {
              alert(response.errors.join('\n'));
            }
          }
        });
      }
    }
  });

 app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template( $('#tmpl-results-table').html() ),
    initialize: function() {
      this.collection = new app.RecordCollection( app.mainView.results );
      this.listenTo(this.collection, 'reset', this.render);
      this.render();
    },
    render: function() {
      this.$el.html( this.template() );

      var frag = document.createDocumentFragment();
      this.collection.each(function(record) {
        var view = new app.ResultsRowView({ model: record });
        frag.appendChild(view.render().el);
      }, this);
      $('#results-rows').append(frag);

      if (this.collection.length === 0) {
        $('#results-rows').append( $('#tmpl-results-empty-row').html() );
      }
    }
  });

  app.ResultsRowView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template( $('#tmpl-results-row').html() ),
    events: {
      'click .btn-dettach': 'dettachBadge'
    },
    dettachBadge: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              app.resultView.render();
            }
            else {
              app.dettachView.model.set(response);
            }
          }
        });
      }      
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      this.$el.find('.timeago').each(function(index, indexValue) {
        if (indexValue.innerText) {
          var myMoment = moment(indexValue.innerText);
          indexValue.innerText = myMoment.from();
          if (indexValue.getAttribute('data-age')) {
            indexValue.innerText = indexValue.innerText.replace('ago', 'old');
          }
        }
      });
      return this;
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.model = new app.Account( JSON.parse( unescape($('#data-record').html()) ) );
      this.results = JSON.parse( unescape($('#data-results').html()) );

      app.headerView = new app.HeaderView();
      app.detailsView = new app.DetailsView();
      app.deleteView = new app.DeleteView();
      app.loginView = new app.LoginView();
      app.badgeView = new app.BadgeView();
      app.resultView = new app.ResultsView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());