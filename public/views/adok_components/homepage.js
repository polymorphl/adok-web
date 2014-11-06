/**
* Homepage
**/

$(function() {
  console.log( "ready!" );

  /*-----  Logo  ------*/


/*-----  Sign-in  ------*/

  var t_signin = $('#t_signin');
  var m_signin = $('#signin');
  var m_fclose = $('#signin .modal__header .close, .box-overlay');
  var overlay = $('.box-overlay');

  t_signin.on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('with--sidebar');
    overlay.css('visibility', 'visible');
    m_signin.hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
  });

  m_fclose.on('click', function(e) {
    $(this).addClass('is-open');
    e.preventDefault();
    overlay.css('visibility', 'hidden');
    m_signin.velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
  });

/*-----  Sign-up  ------*/

  var t_signup = $('#t_signup');
  var m_signup = $('#signup');
  var m_fclose = $('#signup .modal__header .close, .box-overlay');
  var overlay = $('.box-overlay');

  t_signup.on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('with--sidebar');
    overlay.css('visibility', 'visible');
    m_signup.hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
  });

  m_fclose.on('click', function(e) {
    $(this).addClass('is-open');
    e.preventDefault();
    overlay.css('visibility', 'hidden');
    m_signup.velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
  });

/*-----  Contact ------*/

  var t_contact = $('#t_contact');
  var m_contact = $('#contactm');
  var m_fclose = $('#contactm .modal__header .close, .box-overlay');
  var overlay = $('.box-overlay');

  t_contact.on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('body').removeClass('with--sidebar');
    overlay.css('visibility', 'visible');
    m_contact.hide().velocity('transition.slideUpBigIn', { duration: 300 }).addClass('is-open');
  });

  m_fclose.on('click', function(e) {
    $(this).addClass('is-open');
    e.preventDefault();
    overlay.css('visibility', 'hidden');
    m_contact.velocity('transition.slideDownBigOut', { duration: 300 }).removeClass('is-open');
  });
  // --> EOF
});
