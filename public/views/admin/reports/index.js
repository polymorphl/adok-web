(function() {
	'use strict';

	app = app || {};

	app.Report = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			_id: undefined,
			reportID: '',
			desc: ''
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

	// app.HeaderView = Backbone.View.extend({
	// 	el: '#addReport',
	// 	template: _.template( $('#tmpl-addReport').html() ),
	// 	events: {
	// 		'submit form': 'preventSubmit',
	// 		'keypress input[type="text"]': 'addNewOnEnter',
	// 		'click .btn-add': 'addNew'
	// 	},
	// 	initialize: function() {
	// 		this.model = new app.Report();
	// 		this.listenTo(this.model, 'sync', this.render);
	// 		this.render();
	// 	},
	// 	render: function() {
	// 		this.$el.html(this.template( this.model.attributes ));
	// 	},
	// 	addNewOnEnter: function(event) {
	// 		if (event.keyCode !== 13) { return; }
	// 		event.preventDefault();
	// 		this.addNew();
	// 	},
	// 	addNew: function() {
	// 		if (this.$el.find('[name="name"]').val() === '') {
	// 			alert('Please enter a name.');
	// 		}	else if (this.$el.find('[name="desc"]').val() === '') {
	// 			alert('Please enter a description.');
	// 		} else if (this.$el.find('[name="title"]').val() === '') {
	// 			alert('Please enter a title.');
	// 		}
	// 		else {
	// 			this.model.save({
	// 				name: this.$el.find('[name="name"]').val(),
	// 				desc: this.$el.find('[name="desc"]').val(),
	// 				title: this.$el.find('[name="title"]').val()
	// 			},{
	// 				success: function(model, response) {
	// 					if (response.success) {
	// 						model.id = response.Report._id;
	// 						location.href = model.url();
	// 					}
	// 					else {
	// 						alert(response.errors.join('\n'));
	// 					}
	// 				}
	// 			});
	// 		}
	// 	}
	// });

 app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template( $('#tmpl-results-table').html() ),
    initialize: function() {
    	console.log(app.mainView.results);
      this.collection = new app.RecordCollection( app.mainView.results );
      console.log(app.mainView.results);
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
      location.href = '/admin/reports/create/';
      console.log(location.href);
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

      // app.headerView = new app.HeaderView();
      app.resultsView = new app.ResultsView();
    }
  });
  app.mainView = new app.MainView();
}());