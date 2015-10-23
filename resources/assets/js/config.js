// Debug Mode
var debug_on 			= false;

if (typeof(community_id) == 'undefined') {

	// Quellen definieren
	var url_geo_nodes 		= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/format/geojson';
	var url_geo_meshlinks 	= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/active/meshlinks/format/geojson';
	var url_geo_nodes_new 	= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/new/format/geojson';
	var url_geo_nodes_lost	= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/lost/format/geojson';
	
	var url_count_nodes		= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/count/active';
	var url_count_clients	= 'http://nodeapi.vfn-nrw.de/index.php/get/clients/count';
	var url_statistics		= 'http://nodeapi.vfn-nrw.de/index.php/get/statistics';
	
} else {

	var community_id_int 	= parseInt(community_id);

	// Quellen definieren
	var url_geo_nodes 		= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ community_id_int +'/format/geojson';
	var url_geo_meshlinks 	= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ community_id_int +'/active/meshlinks/format/geojson';
	var url_geo_nodes_new 	= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ community_id_int +'/new/format/geojson';
	var url_geo_nodes_lost	= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ community_id_int +'/lost/format/geojson';
	
	var url_count_nodes		= 'http://nodeapi.vfn-nrw.de/index.php/get/nodes/community/'+ community_id_int +'/count/active';
	var url_count_clients	= 'http://nodeapi.vfn-nrw.de/index.php/get/community/'+ community_id_int +'/clients/count';
	var url_statistics		= 'http://nodeapi.vfn-nrw.de/index.php/get/statistics/community/'+ community_id_int;
	
}


// Basiskoordinaten
if (typeof(coords_base_lon) == 'undefined') {
	var coords_base_lon = 7.179200506020559;
}

if (typeof(coords_base_lat) == 'undefined') {
	var coords_base_lat = 51.35899118940779;
}

if (typeof(zoom_base) == 'undefined') {
	var zoom_base = 7;
}

