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

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      app.Register = new app.RegisterView();
      app.RegisterAccept = new app.RegisterAccept();
      app.RegisterDeny = new app.RegisterDeny();
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
