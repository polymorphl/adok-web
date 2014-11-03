Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

export.CalcDistLatLong = function(ecoord, ucoord) {
	var R = 6371;
	var φ1 = Math.radians(ecoord.lat);
	var φ2 = Math.radians(ucoord.lat);
	var Δφ = Math.radians(ucoord.lat - ecoord.lat);
	var Δλ = Math.radians(ucoord.lng - ecoord.lng);
	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        	Math.cos(φ1) * Math.cos(φ2) *
        	Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;

	return (d.toFixed(3));
}
