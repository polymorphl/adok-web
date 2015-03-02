/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.RegisterView = Backbone.View.extend({
    el: '#register',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/eventRegister',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $('#sign .state').text(res.newStatus);
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.RegisterAccept = Backbone.View.extend({
    el: '.register-accept',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/eventRegister/'+$(this).attr('utype')+'/'+$(this).attr('uid')+'/accept',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $(this).hide();
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.RegisterDeny = Backbone.View.extend({
    el: '.register-deny',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/eventRegister/'+$(this).attr('utype')+'/'+$(this).attr('uid')+'/deny',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $(this).hide();
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.ReportModel = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/reports/create',
    defaults: {
      category: '',
      comments: ''
    },
  });

  app.ReportView = Backbone.View.extend({
    el: '#createReport',
    template: _.template( $('#tmpl-createReport').html() ),
    events: {
      'click .btn.btn-create_report': 'addNew'
    },
    initialize: function() {
      this.model = new app.ReportModel();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    addNewOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      event.preventDefault();
      event.stopPropagation();
      this.addNew();
    },
    addNew: function(e) {
      if (this.$el.find('[name="value"]').val() === '') {
        alert('Please enter a category.');
      } else if (this.$el.find('[name="comments"]').val() === '') {
        alert('Please enter a description.');
      }
      else {
        this.model.save({
          category: this.$el.find('[name="category"]').val(),
          comments: this.$el.find('[name="comments"]').val()
        },{
          success: function(model, response) {
            console.log("Pas d'erreur ?");
            if (response.success) {
              // console.log("respo " + JSON.stringify(response));
              // model.id = response.report._id;
              //location.href = model.url();
              console.log("report-> SUCCESS");
            }
            else {
              alert(response.errors.join('\n'));
              console.log("report-> FAIL!");
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
      app.Register = new app.RegisterView();
      app.RegisterAccept = new app.RegisterAccept();
      app.RegisterDeny = new app.RegisterDeny();
      app.reportView = new app.ReportView();      
    }
  });

  app.mainView = new app.MainView();
  if ($('#members').length > 0) {
    $('#members li img').tooltip();
  }
  $('a.fb').attr('href', "https://www.facebook.com/sharer/sharer.php?u=" + document.URL);
  $('a.g').attr('href', "https://plus.google.com/share?url=" + document.URL)
  $('#e_picture').click(function(){
    if ($(this).hasClass('view')) {
      $(this).removeClass('view');
      $(this).children('img').removeClass('view');
    } else {
      $(this).addClass('view');
      $(this).children('img').addClass('view');
    }
  });
  $('#register').click(function(){
    if ($(this).hasClass("unsuscribe")) {
      $(this).removeClass("unsuscribe");
      $(this).addClass("effect00");
    } else if ($(this).hasClass("waiting")) {

    } else {
      $(this).addClass("unsuscribe, effect00");
    }
  });
}());
