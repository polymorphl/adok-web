/**
*
* Map file
*
**/

app = app || {};
var counter = 0;

L.Map.prototype.panToOffset = function (latlng, offset, options) {
	var x = this.latLngToContainerPoint(latlng).x - offset[0]
	var y = this.latLngToContainerPoint(latlng).y - offset[1]
	var point = this.containerPointToLatLng([x, y])
	return this.setView(point, this._zoom, { pan: options })
}

var markers = {};
var ids = [];

var cluster = new L.MarkerClusterGroup({
	showCoverageOnHover: false,
	removeOutsideVisibleBounds: true,
	spiderfyOnMaxZoom: true,
	spiderfyDistanceMultiplier: 2,
	maxClusterRadius: 80
});
cluster.on('clusterclick', function (e) {
	map.fitBounds(e.layer.getBounds(), {
		paddingTopLeft: [$(".m-tool__wrap").width() / 2, 0],
		animate: true
	});
});

var map = L.mapbox.map('map', 'polymorphl.h5e69igh', {
	minZoom: 11, maxZoom: 19,
	accessToken: 'pk.eyJ1IjoicG9seW1vcnBobCIsImEiOiJaTWFpLWI4In0.cPiDB1qRwLUFGWmBRhZinA', //public token for v2.x
	infoControl: false
});

app.TileData = Backbone.Model.extend({
	idAttribute: '_id',
	defaults: {
		eid: '',
		etype: '',
		enbpcur: 0,
		enbpmax: 0,
		etitle: '',
		ecat: '',
		ecateg: '',
		ed1: '',
		eh1: '',
		ed2: '',
		eh2: '',
		eprice: '',
		eplace: '',
		month: '',
		day: '',
		hour: '',
		uid: '',
		uname: '',
		upic: '',
		utype: '',
		distance: '',
		unity: '',
		fromfriend: false,
		prepend: false,
		marker: '',
	}
});

app.TileView = Backbone.View.extend({
	el: 'ul.items',
	template: _.template( $('#tmpl-evenTile').html()),
	events: {
		'click div.eventLocation': 'showOnMap'
	},
	initialize: function(item) {
		var tab = {
			"01":"JAN",
			"02":"FEV",
			"03":"MAR",
			"04":"AVR",
			"05":"MAI",
			"06":"JUIN",
			"07":"JUIL",
			"08":"AOUT",
			"09":"SEP",
			"10":"OCT",
			"11":"NOV",
			"12":"DEC"
		};
		this.model = new app.TileData();
		item.month = tab[item.ed1.split("-")[1]];
		item.day = item.ed1.split("-")[0];
		item.hour = item.eh1;
		this.model.set(item);
		this.render(item.prepend);
	},
	render: function(prepend) {
		if (prepend === true)
			this.$el.prepend(this.template(this.model.attributes));
		else
			this.$el.append(this.template(this.model.attributes));
		return this;
	},
	showOnMap: function(e) {
		e.preventDefault();
		e.stopPropagation();
		if (markers[$(e.currentTarget.parentNode.parentNode).attr('markerid')] == this.model.attributes.marker) {
			var that = this;
			cluster.zoomToShowLayer(this.model.attributes.marker, function() {
				that.model.attributes.marker.openPopup();
			});
			map.panToOffset(this.model.attributes.marker.getLatLng(), [$('.m-tool__wrap').width() / 2, 0]);
		}
	}
});

app.FilterTileView = Backbone.View.extend({
	el: '#tool-home',
	events: {
		'click .event': 'event',
		'click .exchange': 'exchanges',
		'change #range-aroundme': 'scope',
		'click input[name="add-my-network"]': 'onlyNetwork'
	},
	initialize: function(item) {
		console.log("rotot");
		this.tabname = [
			'event',
			'exchange'
		];
		this.type = this.tabname[item.type];
		this.opt = {
			mask: 3, // this value can be found with this formule : sum(allready_checked_item)
			opts: {
				'event': 1,
				'exchange': 2,
				'network': 4
			}
		};
		this.dist = item.edist;
		this.eid = item.eid;
		this.map = item.emap;
		this.marker = item.emarker;
		this.icon = item.eicon;
		this.linked = item.elinked;
		this.selected_distance = parseFloat(document.getElementById('scope-aroundme-ht').innerHTML) * 1000;
		this.checkResults();
		this.scope();
	},
	event: function() {
		if (document.getElementById("cat--1").checked == false && document.getElementById("cat--2").checked == false) {
			document.getElementById("cat--1").checked = true;
			this.opt.mask = this.opt.mask | this.opt.opts['event'];
		}
		if (this.type == "event" && document.getElementById("cat--1").checked == false && document.getElementById("cat--2").checked == true) {
			this.hideShowElem(false);
			this.opt.mask = this.opt.mask ^ this.opt.opts['event'];
		}	else if (this.type == "event") {
				this.opt.mask = this.opt.mask | this.opt.opts['event'];
				this.hideShowElem(true);
		}
	},
	exchanges: function() {
		if (document.getElementById("cat--1").checked == false && document.getElementById("cat--2").checked == false) {
			document.getElementById("cat--2").checked = true;
			this.opt.mask = this.opt.mask | this.opt.opts['exchange'];
		}
		if (this.type == "exchange" && document.getElementById("cat--1").checked == true && document.getElementById("cat--2").checked == false) {
			this.opt.mask = this.opt.mask ^ this.opt.opts['exchange'];
			this.hideShowElem(false);
		}	else if (this.type == "exchange") {
				this.opt.mask = this.opt.mask | this.opt.opts['exchange'];
				this.hideShowElem(true);
		}
	},
	onlyNetwork: function() {
		if (document.getElementById("network-input").checked == true && this.opt.mask & this.opt.opts[this.type]) {
			this.opt.mask = this.opt.mask | this.opt.opts['network'];
			this.hideShowElem(this.linked ? true : false);
			this.checkResults();
		}
		else if (this.opt.mask & this.opt.opts[this.type]) {
			this.opt.mask = this.opt.mask ^ this.opt.opts['network'];
			this.hideShowElem(true);
			this.checkResults();
		}
		else if (document.getElementById("network-input").checked == true) {
			this.opt.mask = this.opt.mask | this.opt.opts['network'];
		}
		else {
			this.opt.mask = this.opt.mask ^ this.opt.opts['network'];
		}
	},
	scope: function() {
		this.selected_distance = parseFloat(document.getElementById('scope-aroundme-ht').innerHTML) * 1000;
		if (this.dist >= this.selected_distance) {
			this.hideShowElem(false);
		} else if (this.opt.mask & this.opt.opts[this.type]) {
			this.hideShowElem(true);
		}
	},
	hideShowElem: function(visibility) {
			if (!visibility) {
				if (this.opt.mask | this.opt.opts[this.type]) {
					this.hideShowMarker(visibility);
					$("[markerid='" + this.eid + "']").hide();
				}
			} else {
					if ((this.opt.mask & this.opt.opts[this.type])
							&& (!this.linked && (this.opt.mask & this.opt.opts['network']) == 0)
							&& this.dist < this.selected_distance) {
						this.hideShowMarker(visibility);
						$("[markerid='" + this.eid + "']").show();
					}
			}
			this.checkResults();
	},
	hideShowMarker: function(visibility) {
		visibility ? cluster.addLayer(markers[this.eid]) : cluster.removeLayer(markers[this.eid]);
	},
	checkResults: function() {
		var nb = $("#tool-home > .results > .items li:visible").length;
		if (nb == 0) {
			$('.no-result').show();
			$('.uptodate').hide();
		}	else {
			$('.no-result').hide();
			$('.uptodate').show();
		}
		$("#tool-home > .count-results > .res").html(nb);
	}
});

app.StackTileView = Backbone.View.extend({
	el: '.waiting-tiles',
	events: {
		'click .area-waiting': 'display_elem'
	},
	initialize: function(item) {
		this.id = item.id;
		$('.uptodate').hide();
		$(".waiting-counter").html(++counter);
		$(".waiting-tiles").show();
		if (counter > 1){
			$(".waiting-tiles .only").hide();
			$(".waiting-tiles .multi").show();
		}else {
			$(".waiting-tiles .only").show();
			$(".waiting-tiles .multi").hide();
		}
		$('[markerid="'+this.id+'"]').hide();
	},
	display_elem: function() {
		$('[markerid="'+this.id+'"]').show();
		$(".waiting-counter").html("0");
		var nb = $("#tool-home > .results > .items li:visible").length;
		if (nb == 0) {
			$('.no-result').show();
			$('.uptodate').hide();
		} else {
		 	$('.no-result').hide();
		 	$('.uptodate').show();
		}
		$("#tool-home > .count-results > .res").html(nb);
		$(".waiting-tiles").hide();
	}
});

app.RegisteredView = Backbone.View.extend({

});

app.NotRegisteredView = Backbone.View.extend({

});

var eventPos = {
		lat : $('#lat').val(),
		lng : $('#lng').val()
	};

function usleep(microseconds) {
	var start = new Date().getTime();
	while (new Date() < (start + microseconds/1000));
	return true;
}

map.on('locationfound', function(e) {
	ctr = e.latlng;
	var homeIcon = L.icon({
		iconUrl: "/media/map-marker/m-home.png",
		iconSize: [70, 105],
		iconAnchor: [36, 100]
	});
	var marker_ctr = new L.Marker([e.latlng.lat, e.latlng.lng]);
	marker_ctr.setIcon(homeIcon);
	marker_ctr.addTo(map);
	getList(e.latlng);
	setTimeout(function() {
		map.panToOffset(e.latlng, [$(".m-tool__wrap").width() / 2, 0]);
	}, 100);
});

map.locate({setView: false});
map.zoomControl.setPosition('topright');
L.control.fullscreen({
	position: 'topright',
	forceSeparateButton: true,
	forcePseudoFullscreen: true
}).addTo(map);
L.control.locate({setView: false})
	.setPosition('topright')
	.addTo(map);

var event_container = $('ul.items');
map.on('locationfound', function(e){
	var ctr2 = L.latLng([ctr['lat'], ctr['lng']]);
	$('li.marker').tooltip();

	$("input[name='network-input']").change(function(e) {
		if ($(this).is(':checked')) {
			$('.marker.displayable:not(linked)').hide();
			$('.marker.displayable:not(linked)').each(function() {
				cluster.removeLayer(markers[$(this).attr('markerid')]);
			});
		} else {
			$('.marker.displayable:not(linked)').show();
			$('.marker.displayable:not(linked)').each(function() {
				cluster.addLayer(markers[$(this).attr('markerid')]);
			});
		}
	});
});

var pictab = [
	[
		'm-activity.png',
		'm-loisir.png',
		'm-sport.png'
	],
	[
		'm-purchase.png',
		'm-sale.png',
		'm-hire.png',
		'm-service.png'
	]
];
var cattab = [
	"activity",
	"exchange"
];

var callCount = false;
function getList(coord) {
	var item = null;
  if (callCount)
    return ;
  callCount = true;
	$.post('/geojson/full', { loc: [coord.lng, coord.lat] }, function(data) {
		$.each(data, function(i, item) {
			if (CalcDistLatLong(coord, {lat : item.pos[1], lng : item.pos[0]}) <= 10) {
				var popupc = '<a target="_blank" class="popup" href="/event/'+cattab[item.type]+'/'+item.id+'">' +
											'<img src="'+item.by.pic+'" class="'+ (item.by.type === "pro" ? "pro" : "acc") +'">' +
											'<div class="right">' +
												'<h2>'+item.t+'</h2>' +
												'<div class="mdesc">'+item.e+'</div>'+
											'</div>'
											'</a>';
				markers[item.id] = new L.Marker(new L.LatLng(item.pos[1], item.pos[0]), {
					title: item.t
				}).bindPopup(popupc, {
					closeButton: false,
					minWidth: 250
				});
				if (pictab[item.type][item.c] != undefined) {
					markers[item.id].setIcon(L.icon({
							iconUrl: "/media/map-marker/" + pictab[item.type][item.c],
							iconSize: [42, 42],
							className: 'leaflet-'+cattab[item.type]
					}));
				} else {
					markers[item.id].setIcon(L.icon({
						iconUrl: "/media/map-marker/m-opp.png",
						iconSize: [42, 42],
						classname: 'leaflet-opportunity'
					}));
				}
				ids.push(item.id);
				new app.TileView({
					eid: item.id,
					etype: item.type,
					enbpcur: 0,
					enbpmax: item.p,
					etitle: item.t,
					ecat: cattab[item.type],
					ecateg: item.c,
					ed1: moment(item.d).format("DD-MM-YYYY"),
					eh1: moment(item.d).format("HH:mm"),
					ed2: (item.d2 == undefined ? '' : ' au '+moment(item.d2).format("DD-MM-YYYY")),
					eh2: (item.d2 == undefined ? '' : moment(item.d2).format("HH:mm")),
					eprice: item.price,
					eplace: item.a.split(",")[0],
					uid: item.by.id,
					uname: item.by.name,
					upic: item.by.pic,
					utype: item.by.type,
					distance: item.dis * 1000,
					unity: item.dis >= 1 ? 'km' : 'm',
					fromfriend: false,
					reply: [],
					prepend: false,
					marker: markers[item.id]
				});
				new app.FilterTileView({
					type: item.type,
					edist: item.dis * 1000,
					eid: item.id,
					emap: map,
					emarker: markers[item.id],
					eicon: pictab[item.type][item.c] == undefined ? 'm-opp.png' : pictab[item.type][item.c],
					elinked: item.linked
				});
				cluster.addLayer(markers[item.id]);
			}
		});
		map.addLayer(cluster);
		//Count result [init]
	}).fail(function(data) {
		console.log("[error]fail getList:" + data);
	});
	refresh = setInterval(function() {
		$.post('/geojson/update', { loc: [coord.lng, coord.lat], idsTab: ids }, function(data) {
			$.each(data, function(i, item) {
				var popupc = '<a target="_blank" class="popup" href="/event/'+cattab[item.type]+'/'+item.id+'">' +
											'<img src="'+item.by.pic+'" class="'+ (item.by.type === "pro" ? "pro" : "acc") +'">' +
											'<div class="right">' +
												'<h2>'+item.t+'</h2>' +
												'<div class="mdesc">'+item.e+'</div>'+
											'</div>'
											'</a>';
				markers[item.id] = new L.Marker(new L.LatLng(item.pos[1], item.pos[0]), {
					title: item.t
				}).bindPopup(popupc, {
					closeButton: false,
					minWidth: 250
				});
				if (pictab[item.type][item.c] != undefined) {
					markers[item.id].setIcon(L.icon({
							iconUrl: "/media/map-marker/" + pictab[item.type][item.c],
							iconSize: [42, 42],
							className: 'leaflet-'+cattab[item.type]
					}));
				} else {
					markers[item.id].setIcon(L.icon({
						iconUrl: "/media/map-marker/m-opp.png",
						iconSize: [42, 42],
						classname: 'leaflet-opportunity'
					}));
				}
				ids.push(item.id);
				new app.TileView({
					eid: item.id,
					etype: item.type,
					enbpcur: 0,
					enbpmax: item.p,
					etitle: item.t,
					ecat: cattab[item.type],
					ecateg: item.c,
					ed1: moment(item.d).format("DD-MM-YYYY"),
					eh1: moment(item.d).format("HH:mm"),
					ed2: (item.d2 == undefined ? '' : ' au '+moment(item.d2).format("DD-MM-YYYY")),
					eh2: (item.d2 == undefined ? '' : moment(item.d2).format("HH:mm")),
					eprice: item.price,
					eplace: item.a.split(",")[0],
					uid: item.by.id,
					uname: item.by.name,
					upic: item.by.pic,
					utype: item.by.type,
					distance: parseFloat(item.dis) * 1000,
					unity: item.dis >= 1 ? 'km' : 'm',
					fromfriend: false,
					reply: [],
					prepend: true,
					marker: markers[item.id]
				});
				new app.FilterTileView({
					type: item.type,
					edist: item.dis * 1000,
					eid: item.id,
					emap: map,
					emarker: markers[item.id],
					eicon: pictab[item.type][item.c] == undefined ? 'm-opp.png' : pictab[item.type][item.c],
					elinked: item.linked
				});
				new app.StackTileView(item);
				cluster.addLayer(markers[item.id]);
			});
		});
	}, 10000);
};
