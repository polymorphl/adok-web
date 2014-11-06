/**
*
* Home on /account & /pro
* Manage tool-home
*
**/

// - action mouse for the home tool
$("#tool-home").mouseover(function() {
		map.doubleClickZoom.disable();
		map.dragging.disable();
		map.scrollWheelZoom.disable();
});
$("#tool-home").mouseleave(function() {
		map.doubleClickZoom.enable();
		map.dragging.enable();
		map.scrollWheelZoom.enable();
});

//Count result in home tool
$(".count-results span.res").before().html($(".items li.displayable:visible").length);

//LocalStorage
if (localStorage.getItem("eve") == undefined)
  localStorage.setItem("eve", "true")
if (localStorage.getItem("exc") == undefined)
  localStorage.setItem("exc", "true")
if (localStorage.getItem("opp") == undefined)
  localStorage.setItem("opp", "true")
$('#cat--1').prop('checked', JSON.parse(localStorage.getItem('eve')));
$('#cat--2').prop('checked', JSON.parse(localStorage.getItem('exc')));
$('#cat--3').prop('checked', JSON.parse(localStorage.getItem('opp')));


//move to marker
// $("body").on("click", "li.marker div div.catwrap", function() {
//   var mkey = $(this).prop("id");
//   var bounds = new L.LatLngBounds([markers[mkey].getLatLng()]);
//   map.fitBounds(bounds, { paddingTopLeft: [$("#map").innerWidth() * 0.5, 0], animate: true, maxZoom: 18 });
//   markers[mkey].openPopup();
// });

// dislay msg when 0 results
// $("#rangeValue, .ff-container input").on('change', function() {
//  console.log($(".ff-items li.displayable:visible").length)
//  if ($(".ff-items li.displayable:visible").length == 0) {
//    $('span.no-res').show();
//  } else
//    $('span.no-res').hide();
// });

// - meter TO Km init & onChange
// + Manage res - no-res
// + dislay msg when 0 results
var nb_res = $(".items li.displayable:visible").length;
var m = $("#range-aroundme").val();
var km = Math.round(m / 100) / 10;

$("#scope-aroundme").html(km);
if (nb_res == 0) {
	//console.log('test init 1');
	$(".results").hide();
	$(".no-result").show();
} else if (nb_res > 0 ){
	//console.log('test init 2');
	$(".no-result").hide();
	$(".results").show();
}

$("#range-aroundme").on('change', function(){
	var nb_res = $(".items li.displayable:visible").length;
	var m = this.value;
	var km = Math.round(m / 100) / 10;
	$("#scope-aroundme").html(km);
	if (nb_res == 0) {
		//console.log('test change 1');
		$(".results").hide();
		$(".no-result").show();
	} else if (nb_res > 0 ){
		//console.log('test change 2');
		$(".no-result").hide();
		$(".results").show();
	}
});
