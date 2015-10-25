var elixir = require('laravel-elixir');

require('laravel-elixir-stylus');

elixir.config.sourcemaps = false;

elixir(function(mix) 
{    
    mix.stylus([
	   'app.styl',
    ], null);
    
    mix.scripts([
	    'libs/jquery-2.1.4.min.js',
	    'libs/jquery.cookie.js',
	    'libs/bootstrap.min.js',
	    'libs/sweetalert.min.js',
	    'libs/ol-3.10.1.js',
	    'libs/jquery.slimscroll.js',
	    'libs/jquery.browser.min.js',
	    'libs/highcharts.js',
	    'libs/highcharts-drilldown.js',
	    
	    'config.js',
	    
	    'functions/adjust_layout.js',
	    'functions/get_url_param.js',
	    'functions/draw_sidebar.js',
	    'functions/draw_nodes.js',
	    'functions/node_details.js',
	    
	    'map.js'
    ], null, 'resources/assets/js');
    
    mix.styles([
	    'libs/bootstrap.min.css',
	    'libs/font-awesome.min.css',
	    'libs/sweetalert.css',
	    'libs/ol-3.10.1.css',
	    
	    '../../../public/css/app.css'
    ], null, 'resources/assets/css');
});
