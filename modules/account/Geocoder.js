exports = module.exports = function(req, res) {

	// console.log(req.cookies['i18next']);
	var lng = (req.cookies && req.cookies['i18next'] ? req.cookies['i18next'] : 'fr');
	var geocoder = require('node-geocoder').getGeocoder('google', 'https', { apiKey: 'AIzaSyCp2_kKWJ9XEVQHOZbNfgP3trYpJ0CyXtQ', language: lng});
	geocoder.geocode(req.body.query, function(err, results) {
		if (err)
			return res.status(400).send('An error occured');
		var ret = [];
		results.forEach(function(item) {
			if (item.streetNumber && item.streetName && item.zipcode) {
				var addr = item.streetNumber+' '+item.streetName+', '+item.zipcode+' '+item.city;
				ret.push({addr: addr, latlng: {lat: item.latitude, lng: item.longitude }});
			}
		});
		res.jsonp(ret);
	});
}
