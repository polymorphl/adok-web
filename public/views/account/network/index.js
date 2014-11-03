(function() {
  'use strict';

  $(document).ready(function(){
    var nmap = L.mapbox.map('map-n', 'polymorphl.h5e69igh', {
      minZoom: 11,
      maxZoom: 18,
      infoControl: false
    });
    nmap.on('locationfound', function(e) {
      nmap.fitBounds(e.bounds, { animate: true });
      var homeIcon = L.icon({
        iconUrl: "/media/wizzem/m-home.png",
        iconSize: [70, 105],
        iconAnchor: [36, 100]
      });
      var marker_ctr = new L.Marker([e.latlng.lat, e.latlng.lng]);
      marker_ctr.setIcon(homeIcon);
      marker_ctr.addTo(nmap);
    });
    nmap.locate({setView: false});
    nmap.zoomControl.setPosition('topright');
    L.control.fullscreen({
      position: 'topright',
      forceSeparateButton: true,
      forcePseudoFullscreen: true
    }).addTo(nmap);
    L.control.locate({setView: false}).setPosition('topright').addTo(nmap);
    
    $('.tile .goto').click(function(){
      var a_lat = $(this).parent('.tile').children('a').children('input.lat').val();
      var a_lng = $(this).parent('.tile').children('a').children('input.lng').val();
      if (isNaN(a_lat) || isNaN(a_lng)) {
        $(this).children('img').css("opacity", ".4");
      } else {
        var userPic = L.icon({
          iconUrl: $(this).parent('.tile').children('a').children('img').attr("src"),
          iconSize: [40, 40],
          iconAnchor: [40, 40]
        });
        var marker_a = new L.Marker([a_lat, a_lng]);
        marker_a.setIcon(userPic);
        marker_a.addTo(nmap);
        var bounds = new L.LatLngBounds([marker_a.getLatLng()]);
        nmap.fitBounds(bounds, { paddingTopLeft: [$("#map").innerWidth() * 0.5, 0], animate: true, maxZoom: 18 });
      }
    });
    $('.tile.pro').hide();
    $('#select div').click(function(){
      if ($(this).hasClass('part')) {
        $('#select div.pro').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
          $('.tile.acc').show();
          $('.tile.pro').hide();
        }
      } else if ($(this).hasClass('pro')) {
        $('#select div.part').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
          $('.tile.pro').show();
          $('.tile.acc').hide();
        }
      }
    });


    //searchbar
    $("#searchbar").autocomplete({
      source: function(req, res) {
        $.post('/usersearch', {
          query: $("#searchbar").val()
        }).done(function(data) {
          res($.map(data, function(item) {
            return {
              label: item.name,
              value: item.name,
              link: item.link
            };
          }));
        }).fail(function() {
          console.log('ERROR');
        })
      },
      minLength: 0,
      select: function(e, ui) {
        location.href = ui.item.link;
      }
    });

  });
  
}());
