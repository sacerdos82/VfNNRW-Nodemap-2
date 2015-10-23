// GET Variablen aus URL auslesen
function get_url_param(param) {
	
    var url_page = window.location.search.substring(1);
    var url_params = url_page.split( '-' );
    
    if (url_params == '') 			{ return null; }
    else if (param == 'lon') 		{ return url_params[0]; }
	else if (param == 'lat') 		{ return url_params[1]; }
	else if (param == 'zoom') 		{ return url_params[2]; }
	else if (param == 'node_id') 	{ return url_params[3]; }
	else 							{ return null; }

};