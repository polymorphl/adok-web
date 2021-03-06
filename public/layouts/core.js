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
var websocketUrl = 'http://www.adok-app.fr/';
var mediaserverUrl = 'http://www.adok-app.fr/media/';

var refresh;

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
	  	$("#contactm").hide();
	  	$("#teamm").hide();
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
	    	console.log("[SEARCHBAR] data result =>", JSON.stringify(data));
	    	var i = 0;
	    	var ite = new Array();
	    	while (data[i]) {
	    		if (data[i].picture) {
	    			ite.push({label: data[i].name, url: data[i].link, icon: data[i].picture});
	    		} else {
	    			ite.push({label: data[i].name, url: data[i].link});
	    		}
	    		++i;
	    	}
	      res(ite);
	    }).fail(function() {
	      console.log('[SEARCHBAR][ERROR] -> ' + $("#asearchbar").val());
	    });
	  },
	  minLength: 3,
	  select: function(e, ui) {
	  	location.href = ui.item.url;
	  	return false;
	  }
	})._renderItem = function (ul, item) {
    return $("<li>")
        .append("<a href='"+item.link+"'><img src='" + item.icon + "' />" + item.name + "</a>")
        .appendTo(ul);
	};
  // });

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

}());
