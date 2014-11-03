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

	//Chat Sidebar
	// - Draggable toggle-view
	$( ".toggle-view" ).draggable({
		axis: "y",
		containment: "parent",
	});
	// - LocalStorage
	if (localStorage.getItem("chat-togtop") == undefined)
		localStorage.setItem("chat-togtop", "100px");
	$(".toggle-view").on("dragstop", function(event, ui) {
		localStorage.setItem("chat-togtop", $('.toggle-view').position().top);
	});
	var $t_togtop = localStorage.getItem("chat-togtop") + "px";
	$(".toggle-view").css('top', $t_togtop);

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

	/*-----  Feedback  ------*/

	var t_feed = $('#t_feedback');
	var m_feed = $('#feedback');
	var m_fclose = $('#feedback .modal__header .close, .box-overlay');
	var overlay = $('.box-overlay');

	t_feed.on('click', function(e){
		e.preventDefault();
		e.stopPropagation();
		$('body').removeClass('with--sidebar');
		overlay.css('visibility', 'visible');
		m_feed.hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
	});

	m_fclose.on('click', function(e) {
		$(this).addClass('is-open');
		e.preventDefault();
		overlay.css('visibility', 'hidden');
		m_feed.velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
	});

	/*-----  Chat  ------*/

	var t_chat = $('#t_chat');
	var m_chat = $('#chat');
	var chat_box = $('input:checkbox#chat-sidebar');
	chat_box.attr('checked', true);
	$(".contact-list .user").on('click', function(e) {
		m_chat.velocity('transition.perspectiveRightOut',
			{ duration: 100, display: 'block' }
			).addClass('is-close');
	});
	t_chat.on('change', function(e){
		e.preventDefault();
		if (chat_box.is(':checked')) {
			m_chat.velocity('transition.perspectiveRightOut',
				{ duration: 100, display: 'block' }
				).addClass('is-close');
		} else {
			m_chat.velocity('transition.perspectiveRightIn',
				{ duration: 400 }
				).removeClass('is-close');
		}
	});

}());
