var width_controls 			= 220;
var width_controls_toggle	= 22;
	

function draw_controls()
{
	var width_window 			= $(window).width();
	var height_window 			= $(window).height();
	var height_header			= $('#header').outerHeight();
	var height_controls			= height_window - height_header;
	
	$('#controls')
		.height(height_window - height_header +'px')
		.css(
		{
			'top': 		height_header +'px',
			'width':	width_controls_toggle +'px'
		});
		
	$('#controls__toggle')
		.height(height_controls +'px')
		
	$('#controls__toggle .wrapper')
		.height(height_controls +'px');
		
	$('#controls .content')
		.width(width_controls - width_controls_toggle - 20 +'px');
		
	$('#controls .wrapper-scroll').slimScroll(
	{ 
		height: height_controls - 40 +'px',
		width: width_controls - width_controls_toggle - 20 + 'px',
		distance: '0px' 
	});
}


function activate_trigger_controls()
{
	var width_window 			= $(window).width();
	var height_window 			= $(window).height();
	var height_header			= $('#header').outerHeight();
	var height_controls			= height_window - height_header;
	
	var controls_open = false;
	$('#controls__toggle')
		.click( function()
		{
			if (controls_open) {
				controls_open = false;
				
				$('#controls').animate(
				{
					'width':	width_controls_toggle +'px',
				}, 'slow');
				
				$(this).find('.wrapper').html('<i class="fa fa-chevron-circle-right"></i>');
				
				// Tooltips erzeugen
				if (! $.browser.mobile) {
					$('#controls__toggle').find('.wrapper .fa-chevron-circle-right').attr('data-toggle', 'tooltip');
					$('#controls__toggle').find('.wrapper .fa-chevron-circle-right').attr('data-placement', 'right');
					$('#controls__toggle').find('.wrapper .fa-chevron-circle-right').attr('title', 'Kontrollen öffnen');
					$('[data-toggle="tooltip"]').tooltip();
				}
			} else {
				controls_open = true;
				
				$('#controls').animate(
				{
					'width':	width_controls +'px',
				}, 'slow');
				
				$(this).find('.wrapper').html('<i class="fa fa-chevron-circle-left"></i>');
			}
			
			$(window).resize( function() 
			{
				controls_open = false;
				$('#controls__toggle').find('.wrapper').html('<i class="fa fa-chevron-circle-right"></i>');
			});
			
			if (debug_on) {
				console.log(
					'Click "controls__toggle"' + ' | ' +
					'controls_open = ' + controls_open
				);
			}
		});
		
	
	// Tooltips erzeugen
	if (! $.browser.mobile) {
		$('#controls__toggle').find('.wrapper .fa-chevron-circle-right').attr('data-toggle', 'tooltip');
		$('#controls__toggle').find('.wrapper .fa-chevron-circle-right').attr('data-placement', 'right');
		$('#controls__toggle').find('.wrapper .fa-chevron-circle-right').attr('title', 'Kontrollen öffnen');
		$('[data-toggle="tooltip"]').tooltip();
	}
}