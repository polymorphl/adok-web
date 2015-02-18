(function() {
	//close alert on click
	$(".alert .close").on("click", function(e){
		e.preventDefault();
		$(this).remove();
	});
}());
