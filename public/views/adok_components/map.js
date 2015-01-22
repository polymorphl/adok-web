/**
*
* Map file
*
**/

app = app || {};

var counter = 0;
var markers = {};
var ids = [];

app.TileData = Backbone.Model.extend({
	idAttribute: '_id',
	defaults: {
		eid: '',
		etype: '',
		enbpcur: 0,
		enbpmax: 0,
		etitle: '',
		edesc: '',
		ecat: '',
		ecateg: '',
		ed1: '',
		ed2: '',
		eplace: '',
		month: '',
		day: '',
		uid: '',
		uname: '',
		upic: '',
		utype: '',
		fromfriend: false,
		prepend: false
	}
});

app.TileView = Backbone.View.extend({
	el: 'ul.items',
	template: _.template( $('#tmpl-evenTile').html()),
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
	}
});

app.FilterTileView = Backbone.View.extend({
	el: '#tool-home',
	events: {
		'click .event': 'event',
		'click input[name="add-my-network"]': 'onlyNetwork'
	},
	initialize: function(item) {
		this.tabname = [
			'event'
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
		this.eid = item.eid;
		this.linked = item.elinked;
		this.checkResults();
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
	hideShowElem: function(visibility) {
			if (!visibility) {
				if (this.opt.mask | this.opt.opts[this.type]) {
					$("[markerid='" + this.eid + "']").hide();
				}
			} else {
					if ((this.opt.mask & this.opt.opts[this.type])
							&& (!this.linked && (this.opt.mask & this.opt.opts['network']) == 0)) {
						$("[markerid='" + this.eid + "']").show();
					}
			}
			this.checkResults();
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

var event_container = $('ul.items');

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

	getList();

var callCount = false;
function getList() {
	var item = null;
  if (callCount)
    return ;
  callCount = true;
	$.post('/geojson/full', function(data) {
		$.each(data, function(i, item) {
			ids.push(item.id);
			new app.TileView({
				eid: item.id,
				etype: item.type,
				enbpcur: 0,
				enbpmax: item.p,
				etitle: item.t,
				edesc: item.e,
				ecat: cattab[item.type],
				ecateg: item.c,
				ed1: moment(item.d).format("DD-MM-YYYY"),
				ed2: (item.d2 == undefined ? '' : ' au '+moment(item.d2).format("DD-MM-YYYY")),
				eplace: item.a.split(",")[0],
				uid: item.by.id,
				uname: item.by.name,
				upic: item.by.pic,
				utype: item.by.type,
				fromfriend: false,
				reply: [],
				prepend: false
			});
			new app.FilterTileView({
				type: item.type,
				eid: item.id,
				elinked: item.linked
			});
		});
	}).fail(function(data) {
		console.log("[error]fail getList:" + data);
	});
	refresh = setInterval(function() {
		$.post('/geojson/update', {idsTab: ids}, function(data) {
			$.each(data, function(i, item) {
				ids.push(item.id);
				new app.TileView({
					eid: item.id,
					etype: item.type,
					enbpcur: 0,
					enbpmax: item.p,
					etitle: item.t,
					edesc: item.e,
					ecat: cattab[item.type],
					ecateg: item.c,
					ed1: moment(item.d).format("DD-MM-YYYY"),
					ed2: (item.d2 == undefined ? '' : ' au '+moment(item.d2).format("DD-MM-YYYY")),
					eplace: item.a.split(",")[0],
					uid: item.by.id,
					uname: item.by.name,
					upic: item.by.pic,
					utype: item.by.type,
					fromfriend: false,
					reply: [],
					prepend: true
				});
				new app.FilterTileView({
					type: item.type,
					eid: item.id,
					elinked: item.linked
				});
				new app.StackTileView(item);
			});
		});
	}, 10000);
};

$(document).ready(function(){
	
});
