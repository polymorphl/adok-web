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
		etitle: '',
		edesc: '',
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
		this.model = new app.TileData();
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
		$(".area-waiting").hide();
		$(".waiting-tiles").show();
		$(".waiting-counter").html(++counter);
		if (counter >= 1) {
			$(".area-waiting").show();
			$(".waiting-tiles .only").hide();
			$(".waiting-tiles .multi").show();
		} else {
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

app.RegisteredView = Backbone.View.extend({});

app.NotRegisteredView = Backbone.View.extend({});

var eventPos = {
		lat : $('#lat').val(),
		lng : $('#lng').val()
	};

var event_container = $('ul.items');

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
				etitle: item.t,
				edesc: item.e,
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
					etitle: item.t,
					edesc: item.e,
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