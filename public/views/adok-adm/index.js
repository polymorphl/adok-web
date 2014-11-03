/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Login = Backbone.Model.extend({
    url: '/adok-adm/',
    defaults: {
      errors: [],
      errfor: {},
      username: '',
      password: ''
    }
  });

  app.LoginView = Backbone.View.extend({
    el: '#login',
    template: _.template( $('#tmpl-login').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress': 'loginOnEnter',
      'click .btn-login': 'login'
    },
    initialize: function() {
      this.model = new app.Login();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      this.$el.find('[name="username"]').focus();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    loginOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      if ($(event.target).attr('name') !== 'password') { return; }
      event.preventDefault();
      this.login();
    },
    login: function() {
      this.$el.find('.btn-login').attr('disabled', true);
      this.model.save({
        username: this.$el.find('[name="username"]').val().toLowerCase(),
        password: this.$el.find('[name="password"]').val(),
      },{
        error: function(model, response, username, password) {
          var responseObj = $.parseJSON(response.responseText);
          console.log('Type: ' + responseObj.error);
          console.log('toto = ' + username + '/' + password);
        },
        success: function(model, response) {
          if (response.success) {
            location.href = response.defaultReturnUrl;
          }
          else {
            model.set(response);
          }
        }
      });
    }
  });


  $(document).ready(function() {
    app.loginView = new app.LoginView();
  });
}());
