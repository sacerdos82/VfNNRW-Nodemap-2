// Darstellung anpassen
function adjust_layout()
{
	var width_window 	= $(window).width();
	var height_window 	= $(window).height();
	
	$('#vfnnrw-map').width(width_window +'px');
	$('#vfnnrw-map').height(height_window +'px');
}