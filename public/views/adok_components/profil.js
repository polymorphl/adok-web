(function() {
	//close alert on click
	$(".alert .close").on("click", function(e){
		e.preventDefault();
		console.log("test");
		$(this).remove();
	});
}());
