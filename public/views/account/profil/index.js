/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Account = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/user/'
  });

  app.User = Backbone.Model.extend({
    idAttribute: '_id',
    url: '/user/'
  });

  app.Picture = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      picture: ''
    },
    url: '/upload/image/avatar',
    parse: function(response) {
      if (response.user) {
        app.mainView.user.set(response.user);
        delete response.user;
      }
      return response;
    }
  });

  app.Details = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      first: '',
      last: ''
    },
    url: '/user/',
    parse: function(response) {
      if (response.account) {
        app.mainView.account.set(response.account);
        delete response.account;
      }
      return response;
    }
  });

  app.LinksView = Backbone.View.extend({
    el: '#link',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/friends/add',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $('#link').text(res.newStatus);
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.LinksCancelView = Backbone.View.extend({
    el: '#link-cancel',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/friends/cancel',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $('#link-cancel').text(res.newStatus);
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.LinksAcceptView = Backbone.View.extend({
    el: '#link-accept',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/friends/accept',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $('#link-accept').text(res.newStatus);
            $('#link-deny').remove();
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.LinksDenyView = Backbone.View.extend({
    el: '#link-deny',
    events: {
      'click': 'update'
    },
    update: function() {
      $.ajax({
        url: '/friends/deny',
        type: 'POST',
        cache: false,
        contentType: false,
        processData: false,
        async: true,
        success: function(res) {
          if (res.success) {
            $('#link-accept').text(res.newStatus);
            $('#link-deny').remove();
          } else
            alert(res.errors[0]);
        }
      });
    }
  });

  app.PictureView = Backbone.View.extend({
    el: '#picture',
    template: _.template( $('#tmpl-picture').html() ),
    initialize: function() {
      this.model = new app.Picture();
      this.syncUp();
      this.listenTo(app.mainView.user, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.account.id,
        picture: app.mainView.user.get('picture')
      });
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      var count = 0;
      $("#avatarUpload").fileupload({
        dataType: 'json',
        add: function(e, data) {
          if (data.files[0].size < 12582912)
            data.submit();
          else
            alert("Taille maximale du fichier: 12 Mo");
        },
        done: function(e, data) {
          if (data.result.success) {
            $('.self-avatar').attr('src', data.result.picture+'?'+count);
          } else {
            alert(data.result.errors[0]);
          }
        }
      });
    }
  });

  app.DetailsView = Backbone.View.extend({
    el: '#details',
    template: _.template( $('#tmpl-details').html() ),
    events: {
      'click .btn-update': 'detailEditable',
      'click .btn-update-valid': 'update',
      'click .close': 'close_response'
    },
    initialize: function() {
      this.model = new app.Details();
      this.syncUp();
      this.listenTo(app.mainView.account, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    close_response: function() {
      $(".alerts").hide();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.account.id,
        first: app.mainView.account.get('name').first,
        last: app.mainView.account.get('name').last
      });
    },
    render: function() {
      var that = this;
      this.$el.html(this.template( this.model.attributes ));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        }
      }
    },
    detailEditable: function() {
      $("#up, #place").hide();
      $(".btn-update-valid, #place-edit").show();
      $('.mobile i, .place i').hide()
      $("#first").replaceWith("<input placeholder='Prénom' class='.form-control' type='text' name='first' value='"+$("#first").html()+"'/>");
      $("#last").replaceWith("<input placeholder='Nom' class='.form-control' type='text' name='last' value='"+$("#last").html()+"'/>");
    },
    update: function(){
      $("#place").show();
      $("#first").replaceWith("<p id='first'>"+this.$el.find('[name="first"]').val()+"</p>");
      $("#last").replaceWith("<p id='last'>"+this.$el.find('[name="last"]').val()+"</p>");
      $("#place-edit").css("display", "none");
      this.model.save({
        first: this.$el.find('[name="first"]').val(),
        last: this.$el.find('[name="last"]').val()
      });
      $(".btn-update").show();
      $(".btn-update-valid").hide();
    }
  });

  app.HistoryModel = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      id: '',
      photos: '',
      title: '',
      date: '',
      date2: '',
      fclas: '',
      clas: '',
      numOfPtc: '',
      desc: ''
    }
  });

  app.HistoryView = Backbone.View.extend({
    el: '.scroll',
    template: _.template( $('#tmpl-history').html() ),
    initialize: function(item) {
      item.clas = 'acv';
      item.fclas = 'activity';
      item.date = moment(item.date).format('DD.MM.YYYY - HH:mm');
      item.date2 = moment(item.date2).format('DD.MM.YYYY - HH:mm');
      this.model = new app.HistoryModel();
      this.model.set(item);
      console.log(this.model.attributes);
      this.render();
    },
    render: function() {
      this.$el.html(this.$el.html() + this.template(this.model.attributes));
      return this;
    }
  });

  app.WrapHistoryView = Backbone.View.extend({
    el: '#wrap-history',
    initialize: function(item) {
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      $("#wrap-history").css("height", (h - $(".m-zone").height() - (h/12)) + "px");
      $(".scroll").css("height", (item.length * 207) + "px");
      var history_scroll = new IScroll('#wrap-history', {
        mouseWheel: true,
        scrollbars: true
      });

      var i = 0;
      while (i < item.length)
      {
        new app.HistoryView(item[i]);
        ++i;
      }
    }
  });

  app.NetworkModalModel = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
      id: ''
    }
  });

  app.NetworkModalView = Backbone.View.extend({
    el: '#network, .third-part',
    events: {
      'click #t_network': 'display_network',
      'click .close': 'close_network'
    },
    initialize: function(item) {
      this.render();
    },
    close_network: function(e) {
      $('#network .modal__header .close, .box-overlay').addClass('is-open');
      e.preventDefault();
      $('.box-overlay').removeClass("is-active");
      $("body").removeClass("modal-open");
      $('#network').velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
    },
    display_network: function(e) {
      e.preventDefault();
      e.stopPropagation();
      $('body').removeClass('with--sidebar');
      $('.box-overlay').addClass("is-active");
      $("body").addClass("modal-open");
      $('#network').hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
    },
    render: function() {
      return this;
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.app-content .page-container',
    initialize: function() {
      app.mainView = this;
      this.account = new app.Account( JSON.parse( unescape($('#data-account').html()) ) );
      this.user = new app.User( JSON.parse( unescape($('#data-user').html()) ) );

      app.pictureView = new app.PictureView();
      app.detailsView = new app.DetailsView();
      app.Links = new app.LinksView();
      app.LinkCancel = new app.LinksCancelView();
      app.LinkAccept = new app.LinksAcceptView();
      app.LinkDeny = new app.LinksDenyView();
      app.NetworkModal = new app.NetworkModalView();
      app.WrapHistory = new app.WrapHistoryView(JSON.parse( unescape($('#data-history-event').html()) ));
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
    $(".btn-update-valid, #place-edit").hide();
  });
}());
