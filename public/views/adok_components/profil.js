/**
*
* JS public pour la zone
*
**/

(function() {
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
}());
