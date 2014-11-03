(function() {
  'use strict';

  $(document).ready(function(){

    if ($("#rangeValue").length > 0) {
      var val_1 = $("#rangeValue").val();
      $('#range-slider-box output').text(val_1);
      $("#rangeValue").on('change', function(){
        var valof = $(this).val();
        $('output').text(valof);
      });
    }

    $('a#tri').unbind("click").click(function(e){
      if ($(this).hasClass("opcl")) {
        $('#tools').css('display', 'block');
        $('.ff-container label').css('display', 'inline-block');
        $(this).removeClass("opcl");
      } else if (!$(this).hasClass("opcl")) {
        $('#tools, .ff-container label').hide();
        $(this).attr("class", "opcl");
      }
    });

/*-----  Velocity: inventory ------*/

   	var t_inv = $('#t_inv');
		var m_inv = $('#inv');
		var inv_box = $('input:checkbox#inv-sidebar');
		inv_box.attr('checked', true);
		t_inv.on('change', function(e){
			e.preventDefault();
			if (inv_box.is(':checked')) {
				m_inv.velocity('transition.perspectiveLeftOut',
					{ duration: 200, display: 'block' }
					).addClass('is-close');
			} else {
				m_inv.velocity('transition.perspectiveLeftIn',
					{ duration: 300 }
					).removeClass('is-close');
				var x = $("#inv .content");
				function getLocation() {
				    if (navigator.geolocation) {
				        navigator.geolocation.watchPosition(showPosition);
				    } else {
				        x.append("Geolocation is not supported by this browser.");
				    }
				}
				function showPosition(position) {
					console.log("Lat: " + position.coords.latitude);
				    x.append("Latitude: " + position.coords.latitude +
				    "<br>Longitude: " + position.coords.longitude);
				}
				getLocation();
				console.log("getLocation OK");
			}
		});



  });
}());
