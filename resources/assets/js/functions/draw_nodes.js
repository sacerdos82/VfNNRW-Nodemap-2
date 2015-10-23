var width_nodes 		= 530;	
var width_nodes_toggle	= 22;
var nodes_open 			= false;


function draw_nodes()
{
	var width_window 			= $(window).width();
	var height_window 			= $(window).height();
	var height_header			= $('#header').outerHeight();
	var height_nodes			= height_window - height_header;

	if (width_window >= 768) {
		width_nodes = 530;
	} else {
		width_nodes = width_window - width_controls_toggle - 10;
		activate_trigger_nodes();
	}

	$('#nodes')
		.height(height_window - height_header +'px')
		.css(
		{
			'top': 		height_header +'px',
			'width':	width_nodes_toggle +'px'
		});
		
	$('#nodes__toggle')
		.height(height_nodes +'px')
		
	$('#nodes__toggle .wrapper')
		.height(height_nodes +'px');
		
	$('#nodes .content')
		.width(width_nodes - width_nodes_toggle - 30 +'px');
		
	$('.ol-zoom').css('right', 10 + width_nodes_toggle +'px');
	$('.ol-attribution').css('right', 10 + width_nodes_toggle +'px');
	
	$('#nodes .wrapper-scroll').slimScroll(
	{ 
		height: height_nodes - 60 +'px',
		width: width_nodes - width_nodes_toggle - 30 + 'px',
		distance: '0px' 
	});
}


function activate_trigger_nodes()
{
	$('#nodes__toggle')
		.unbind('click')
		.click( function()
		{
			if (nodes_open) {
				close_nodes();
			} else {
				open_nodes();
			}
			
			$(window).resize( function() 
			{
				nodes_open = false;
				$('#nodes__toggle').find('.wrapper').html('<i class="fa fa-chevron-circle-left"></i>');
			});
			
			if (debug_on) {
				console.log(
					'Click "nodes__toggle"' + ' | ' +
					'nodes_open = ' + nodes_open + ' | ' +
					'width_nodes = ' + width_nodes + ' | ' +
					'nodes_nodes_toggle = ' + width_nodes_toggle
				);
			}
		});
}


function close_nodes()
{
	nodes_open = false;
	
	// Browserzeile anpassen
	window.history.pushState(	{ urlPath: '?' + get_url_param('lon') + '-' + get_url_param('lat') + '-' + get_url_param('zoom') },
								'', 
								'?' + get_url_param('lon') + '-' + get_url_param('lat') + '-' + get_url_param('zoom') );
	
	$('#nodes').animate(
	{
		'width': width_nodes_toggle +'px',
	}, 'slow');
	
	$('.ol-zoom').animate(
	{
		'right': 10 + width_nodes_toggle +'px',
	}, 'slow');
	
	$('.ol-attribution').animate(
	{
		'right': 10 + width_nodes_toggle +'px',
	}, 'slow');
	
	$('#nodes__toggle').find('.wrapper').html('<i class="fa fa-chevron-circle-left"></i>');
}


function open_nodes(node_id)
{
	nodes_open = true;

	if (debug_on) {
		console.log(
			'#node-id = '+ $('#node-id').html() +' | '+
			'node_id = '+ node_id
		);
	}
	

	// Browserzeile anpassen
	open_node_id = parseInt($('#node-id').html());
	if (open_node_id != false && open_node_id != undefined) {
		window.history.pushState(	{ urlPath: '?' + get_url_param('lon') + '-' + get_url_param('lat') + '-' + get_url_param('zoom') },
								'', 
								'?' + get_url_param('lon') + '-' + get_url_param('lat') + '-' + get_url_param('zoom') );

		var s_page_url = window.location.search.substring(1);
		window.history.pushState(	{ urlPath: '?' + s_page_url + '-' + open_node_id },
									'', 
									'?'+ s_page_url + '-' + open_node_id );
	}
			
	if (node_id != undefined) {
		window.history.pushState(	{ urlPath: '?' + get_url_param('lon') + '-' + get_url_param('lat') + '-' + get_url_param('zoom') },
								'', 
								'?' + get_url_param('lon') + '-' + get_url_param('lat') + '-' + get_url_param('zoom') );

		var s_page_url = window.location.search.substring(1);
		window.history.pushState(	{ urlPath: '?' + s_page_url + '-' + node_id },
									'', 
									'?'+ s_page_url + '-' + node_id );
	}
	
	
	$('#nodes').animate(
	{
		'width': width_nodes +'px',
	}, 'slow');
	
	$('.ol-zoom').animate(
	{
		'right': 10 + width_nodes +'px',
	}, 'slow');
	
	$('.ol-attribution').animate(
	{
		'right': 10 + width_nodes +'px',
	}, 'slow');
	
	$('#nodes__toggle').find('.wrapper').html('<i class="fa fa-chevron-circle-right"></i>');
}