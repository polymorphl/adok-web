(function() {
	'use strict';

	app = app || {};

	app.Report = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined,
			name: '',
			desc: '',
			title: ''
		},
		url: function() {
			return '/admin/reports/'+ (this.isNew() ? '' : this.id +'/');
		}
	});

  app.RecordCollection = Backbone.Collection.extend({
	  model: app.Report,
	  url: '/admin/reports/',
	  parse: function(results) {
	    return results.data;
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
      	console.log(record);
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
      'click .btn-details': 'viewDetails'
    },
    viewDetails: function() {
      location.href = this.model.url();
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
    el: '.page-container',
    initialize: function() {
      app.mainView = this;
      this.results = JSON.parse( unescape($('#data-results').html()) );

      app.resultsView = new app.ResultsView();
    }
  });
  app.mainView = new app.MainView();
}());