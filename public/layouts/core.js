/* global app:true */
/* exported app */

var app = app || {};
var ctr;
var markers = [];
var greatestId = {
	a: '000000000000000000000000',
	e: '000000000000000000000000',
	o: '000000000000000000000000'
};
var refresh;

// //Google Analytics
// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
// ga('create', 'UA-49788805-1', 'wizzem.fr');
// ga('send', 'pageview');

(function() {

	'use strict';

//Change language
	// - read the cookie
	function readCookie(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1,c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	}
	// - init & click event
	var _lang = readCookie('i18next');
	var _selector = ".lang ." + _lang.toLowerCase();
	$(_selector).addClass('active');
	moment.locale(_lang.toLowerCase());
	$.i18n.init({
		lng: _lang.toLowerCase(),
		ns: 'translation',
		resGetPath: '/locales/__lng__/__ns__.json'
	});

	$('.lang a').click(function(){
		var $lang = $(this).closest( "span" ).text();
		var tolang = $lang.toLowerCase();
		var selector = ".lang ." + tolang;
		$(selector).addClass('active');
		var url = "http://" + window.location.host + window.location.pathname + "?setLng=" + tolang;
		window.location.href = url;
	});

	//Responsive
	// - icon
	$('#header__icon').click(function(e){
			e.preventDefault();
			$('body').toggleClass('with--sidebar');
	});
	// - app-cache
	$('#app-cache').click(function(e){
		$('body').removeClass('with--sidebar');
	});

	/*----- Ripple buttons  ------*/
	var rippleOptions = {
		'elements'  :'button',
		'focus'     :'button'
	};
	var rippleEffect = new $.RippleEffect(rippleOptions);

	/*-----  usleep function  ------*/
	function usleep(microseconds) {
	  var start = new Date().getTime();
	  while (new Date() < (start + microseconds/1000));
	  return true;
	}

	/*-----  Ajax spinner follows mouse  ------*/
	$(document).bind('mousemove', function(e) {
		$('.ajax-spinner').css({
			left: e.pageX + 15,
			top: e.pageY
		});
	});

	/**
	*
	* Velocity
	*
	**/

	// DISABLE box-overlay when ESC
	$(document).keyup(function(event) {
	  if (event.keyCode == 27 && $('.box-overlay').hasClass("is-active")) {
	  	$('.box-overlay').removeClass("is-active");
	  	$("body").removeClass("modal-open");
	  	$("#propose").hide();
	  	$("#contact").hide();
	  	$("#team").hide();
	  	$("#signup").hide();
	  	$("#signin").hide();
	  	$("#network").hide();
	  	$("#badge").hide();
	  	$("#feedback").hide();
	  	$('#delete_prop').hide();
	  	$('#report_u').hide();
	  	$('#report_c').hide();
	  }
	});

	//Searchbar in header
	$("#asearchbar").autocomplete({
	  source: function(req, res) {
	    $.post('/usersearch', {
	      query: $("#asearchbar").val()
	    }).done(function(data) {
	      res($.map(data, function(item) {
	        return {
	          label: item.name,
	          value: item.name,
	          link: item.link
	        };
	      }));
	    }).fail(function() {
	      console.log('[ERROR] -> wizzem_searchbar ->');
	      console.log($("#asearchbar").val());
	    })
	  },
	  minLength: 0,
	  select: function(e, ui) {
	    location.href = ui.item.link;
	  }
	});

	/*-----  Feedback  ------*/

	var t_feed = $('#t_feedback');
	var m_feed = $('#feedback');
	var m_fclose = $('#feedback .modal__header .close, .box-overlay');
	var overlay = $('.box-overlay');

	t_feed.on('click', function(e){
		e.preventDefault();
		e.stopPropagation();
		$('body').removeClass('with--sidebar');
		overlay.addClass('is-active');
		$("body").addClass("modal-open");
		m_feed.hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
	});

	m_fclose.on('click', function(e) {
		$(this).addClass('is-open');
		e.preventDefault();
		overlay.removeClass('is-active');
		$("body").removeClass("modal-open");
		m_feed.velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
	});

	/*-----  Chat  ------*/
	var m_chat = $('#chat'); //				wrap du chat
	var t_chat = $('#t_chat'); // 		toggle-view
	var clo_chat = $("#clo_chat"); //	close chat
	var cu_chat = $("#cu_chat"); // 	current-chat
	var clo_cur =$("#clo_cur"); //		close-current


	t_chat.on("click", function(){
		m_chat.velocity('transition.bounceRightIn', { duration: 200, display: 'block', opacity: 1}).removeClass('is-close');
		t_chat.velocity('transition.bounceRightOut', { duration: 100 });
		$("body").addClass("sidebar-open");
	});

	clo_chat.on("click", function(){
		m_chat.velocity('transition.bounceRightOut', { duration: 200, display: 'block', opacity: 1}).addClass('is-close');
		t_chat.fadeIn();
		$("body").removeClass("sidebar-open");
	});

	$(".contact-list .user").on('click', function(e) {
		cu_chat.velocity('transition.bounceIn', { duration: 100 });
		$("#chat .list, #chat .search").hide();
	});


}());
