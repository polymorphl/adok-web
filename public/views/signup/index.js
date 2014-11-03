// /* global app:true */

// (function() {
//   'use strict';

//   var dateEN = {
//     date: {
//       previousMonth : 'Previous Month',
//       nextMonth     : 'Next Month',
//       months        : ['January','February','March','April','May','June','July','August','September','October','November','December'],
//       weekdays      : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
//       weekdaysShort : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
//       timeTitles    : ['Hours', 'Minutes']
//     },
//     format: 'MM-DD-YYYY',
//     meridian: true,
//     firstDay: 0
//   };

//   var dateFR = {
//     date: {
//       previousMonth : 'Mois précedent',
//       nextMonth     : 'Mois suivant',
//       months        : ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
//       weekdays      : ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
//       weekdaysShort : ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
//       timeTitles    : ['Heures', 'Minutes']
//     },
//     format: 'DD-MM-YYYY',
//     meridian: false,
//     firstDay: 1
//   };

//   function getCookie(cname)
//   {
//     var name = cname + "=";
//     var ca = document.cookie.split(';');
//     for(var i=0; i<ca.length; i++)
//       {
//       var c = ca[i].trim();
//       if (c.indexOf(name)==0) return c.substring(name.length,c.length);
//       }
//     return "";
//   }

//   app = app || {};

//   app.Signup = Backbone.Model.extend({
//     url: '/signup',
//     defaults: {
//       errors: [],
//       errfor: {},
//       firstname: '',
//       lastname: '',
//       birthdate: '',
//       sex: '',
//       email: '',
//       password: '',
//       passwordConfirm: '',
//       cgu: ''
//     }
//   });

//   app.SignupView = Backbone.View.extend({
//     el: '#signup-form',
//     template: _.template( $('#tmpl-signup').html() ),
//     events: {
//       'submit form': 'preventSubmit',
//       'keypress': 'signupOnEnter',
//       'click .btn-signup': 'signup'
//     },
//     initialize: function() {
//       this.model = new app.Signup();
//       this.listenTo(this.model, 'sync', this.render);
//       this.render();
//     },
//     render: function() {
//       this.$el.html(this.template( this.model.attributes ));
//       var lng = (getCookie('i18next') == 'fr') ? (dateFR) : (dateEN);
//       this.$el.find('[name="birthdate"]').pikaday({
//         minDate: moment(moment().startOf('year').subtract('years', 90)).toDate(),
//         maxDate: moment(moment().endOf('year').subtract('years', 11)).toDate(),
//         defaultDate: moment(moment().startOf('year')).toDate(),
//         yearRange: [moment(moment().startOf('year').subtract('years', 90)).years(), moment(moment().startOf('year').subtract('years', 11)).years()],
//         firstDay: lng.firstDay,
//         format: lng.format,
//         i18n: lng.date,
//         showMeridian: lng.meridian
//       });
//     },
//     preventSubmit: function(event) {
//       event.preventDefault();
//     },
//     signupOnEnter: function(event) {
//       if (event.keyCode !== 13) { return; }
//       event.preventDefault();
//       this.signup();
//     },
//     signup: function() {
//       this.$el.find('.btn-signup').attr('disabled', true);

//       this.model.save({
//         firstname: this.$el.find('[name="firstname"]').val(),
//         lastname: this.$el.find('[name="lastname"]').val(),
//         birthdate: this.$el.find('[name="birthdate"]').val(),
//         sex: this.$el.find('[name="sex"]:checked').val(),
//         email: this.$el.find('[name="email"]').val().toLowerCase(),
//         password: this.$el.find('[name="password"]').val(),
//         passwordConfirm: this.$el.find('[name="passwordConfirm"]').val(),
//         cgu: this.$el.find('[name=cgu]').is(':checked')
//       },{
//         success: function(model, response) {
//           if (response.success) {
//             location.href = response.defaultReturnUrl;
//           }
//           else {
//             model.set(response);
//           }
//         }
//       });
//     }
//   });

//   $(document).ready(function() {
//     app.signupView = new app.SignupView();
//   });
// }());
