/* global app:true */
/* exported app */

var app;

(function() {
	'use strict';

	app = app || {};

	app.Feedback = Backbone.Model.extend({
		url: '/feedback',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			email: '',
			message: ''
		}
	});
	
	app.FeedbackView = Backbone.View.extend({
		el: '#feedbackv',
		template: _.template( $('#tmpl-feedback').html() ),
		events: {
			'submit form': 'preventSubmit',
			'click .btn-feedback': 'feedback'
		},
		initialize: function() {
			var that = this;
			this.model = new app.Feedback();
			this.listenTo(this.model, 'sync', this.render);
			this.render();
			$('.l-footer__feedback .btn').on('click', function() {
				that.model.save({
					email: '',
					message: ''
				});
			});
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
			this.$el.find('[name="email"]').focus();
		},
		preventSubmit: function(event) {
			event.preventDefault();
		},
		feedback: function() {
			this.$el.find('.btn-feedback').attr('disabled', true);

			this.model.save({
				email: this.$el.find('[name="email"]').val(),
				message: this.$el.find('[name="message"]').val()
			});
 		}
	});
 $(document).ready(function(){
		app.feedbackView = new app.FeedbackView();
 });
}());
