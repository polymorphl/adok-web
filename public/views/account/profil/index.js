/* global app:true */

(function() {
  'use strict';

  app = app || {};

  var dateEN = {
    date: {
      previousMonth : 'Previous Month',
      nextMonth     : 'Next Month',
      months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
      weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      timeTitles    : ['Hours', 'Minutes']
    },
    format: 'MM-DD-YYYY',
    meridian: true,
    firstDay: 0
  };

  var dateFR = {
    date: {
      previousMonth : 'Mois précedent',
      nextMonth     : 'Mois suivant',
      months        : ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
      weekdays      : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
      weekdaysShort : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
      timeTitles    : ['Heures', 'Minutes']
    },
    format: 'DD-MM-YYYY',
    meridian: false,
    firstDay: 1
  };

  function getCookie(cname)
  {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
      {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
    return "";
  }

  var lng = (getCookie('i18next') == 'fr') ? (dateFR) : (dateEN);

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
    events: {
      'submit form': 'preventSubmit',
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Picture();
      this.syncUp();
      this.listenTo(app.mainView.user, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.account.id,
        picture: app.mainView.user.get('picture')
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
      var data = new FormData();
      var filesList = document.getElementById('files');
      if (filesList.files.length > 0) {
        for (var i = 0; i < filesList.files.length; i ++) {
          data.append('file', filesList.files[i]);
        }
        $.ajax({
          url: '/upload/image/avatar',
          type: 'POST',
          data: data,
          cache: false,
          contentType: false,
          processData: false,
          async: true,
          success: function(res) {
          	if (res.success) {
  	          $('#avatar').attr('src', res.picture);
  	          $("#minavatar").attr('src', res.picture);
  	        } else
  	        	alert(res.errors[0]);
            // this.model.save({
            //   picture: res.picture
            // });
          }
        });
      }
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
      this.listenTo(app.mainView.account, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
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
    update: function() {
      this.model.save({
        first: this.$el.find('[name="first"]').val(),
        last: this.$el.find('[name="last"]').val()
      });
    }
  });

  app.NotifLinkAccept = Backbone.View.extend({
    el: '.link.askn',
    events: {
      'click .accept': 'accept'
    },
    accept: function() {
      var that = this;
      $.post('/feed/follow/accept', {
        uid: this.$el.find('#actions').attr('uid'),
        type: this.$el.find('#actions').attr('linktype'),
        nid: this.$el.find('#actions').attr('nid')
      }).done(function(data) {
        $(that.el).remove();
      }).fail(function() {
        alert('An error occured');
      });
    }
  });

  app.NotifLinkDeny = Backbone.View.extend({
    el: '.link.askn',
    events: {
      'click .deny': 'deny'
    },
    deny: function() {
      var that = this;
      $.post('/feed/follow/deny', {
        uid: this.$el.find('#actions').attr('uid'),
        type: this.$el.find('#actions').attr('linktype'),
        nid: this.$el.find('#actions').attr('nid')
      }).done(function(data) {
        $(that.el).remove();
      }).fail(function() {
        alert('An error occured');
      });
    }
  });

  app.NotifEventAccept = Backbone.View.extend({
    el: '#ntf.event',
    events: {
      'click .accept': 'accept'
    },
    accept: function() {
      var that = this;
      $.post('/eventRegister/accept', {
        nid: this.$el.find('#actions').attr('nid'),
        uid: this.$el.find('#actions').attr('uid'),
        type: this.$el.find('#actions').attr('utype'),
        eid: this.$el.find('#actions').attr('eid'),
        etype: this.$el.find('#actions').attr('etype'),
      }).done(function(data) {
        $(that.el).remove();
        console.log(data);
      }).fail(function() {
        alert('An error occured');
      });
    }
  });

  app.NotifEventDeny = Backbone.View.extend({
    el: '#ntf.event',
    events: {
      'click .deny': 'deny'
    },
    deny: function() {
      var that = this;
      $.post('/eventRegister/deny', {
        nid: this.$el.find('#actions').attr('nid'),
        uid: this.$el.find('#actions').attr('uid'),
        type: this.$el.find('#actions').attr('utype'),
        eid: this.$el.find('#actions').attr('eid'),
        etype: this.$el.find('#actions').attr('etype'),
      }).done(function(data) {
        $(that.el).remove();
        console.log(data);
      }).fail(function() {
        alert('An error occured');
      });
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
      app.LinkNotifAccept = new app.NotifLinkAccept();
      app.LinkNotifDeny = new app.NotifLinkDeny();
      app.EventNotifAccept = new app.NotifEventAccept();
      app.EventNotifDeny = new app.NotifEventDeny();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
