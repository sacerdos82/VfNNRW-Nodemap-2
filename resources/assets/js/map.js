$(document).ready( function()
{
	// Darstellung anpassen
	adjust_layout();
	draw_controls();
	draw_nodes();
	
	$(window).resize( function() 
	{ 
		adjust_layout(); 
		draw_controls();
		draw_nodes();
	});
	
	
	// Trigger aktivieren
	activate_trigger_controls();
	activate_trigger_nodes();
	
	
	// Position laden
	if (get_url_param('lon') 		!= null) { var coords_map_lon 	= parseFloat(get_url_param('lon')); }		else { var coords_map_lon = coords_base_lon; };
	if (get_url_param('lat') 		!= null) { var coords_map_lat 	= parseFloat(get_url_param('lat')); } 		else { var coords_map_lat = coords_base_lat; };
	if (get_url_param('zoom') 		!= null) { var zoom_map 		= parseInt(get_url_param('zoom')); } 		else { var zoom_map = zoom_base; };
	if (get_url_param('node_id') 	!= null) { var node_id 			= parseInt(get_url_param('node_id')); }		else { var node_id = null; };
	
	if (debug_on) {
		console.log(
			'coords_map_lon = ' + coords_map_lon + ' | ' +
			'coords_map_lat = ' + coords_map_lat + ' | ' +
			'zoom_map = ' + zoom_map + ' | ' +	
			'node_id = ' + node_id
		);
	}
	
	
	// Knotendetails öffenen, wenn in URL angegeben
	if (node_id != null) {
		$.ajax(
		{	
			type: 'GET',
			url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/' + node_id,
			dataType: 'json'
		}
		).done( function(node) 
		{ 	
			var node_position = new ol.proj.transform([parseFloat(node.Longitude), parseFloat(node.Latitude)], 'EPSG:4326', 'EPSG:3857');
			
			source_marker_node_open.clear();
			var feature_node_marker = new ol.Feature({
				geometry: new ol.geom.Point(node_position),
				name: 'node_open_marker'
			});
				
			source_marker_node_open.addFeature(feature_node_marker);
			marker_node_visible = true;
		});

		node_details(node_id);
	}
	
	
	// Quellen laden
	var source_nodes = 			new ol.source.Vector(
								{
	           						projection: 'EPSG:3857',
									url: url_geo_nodes,
									format: new ol.format.GeoJSON()
	       						});
	        						
	var source_meshlinks =		new ol.source.Vector(
								{
	           						projection: 'EPSG:3857',
									url: url_geo_meshlinks,
									format: new ol.format.GeoJSON()
	       						});
	        						
	var source_nodes_new =		new ol.source.Vector(
								{
	           						projection: 'EPSG:3857',
									url: url_geo_nodes_new,
									format: new ol.format.GeoJSON()
	       						});
	        						
	var source_nodes_lost =		new ol.source.Vector(
								{
	           						projection: 'EPSG:3857',
									url: url_geo_nodes_lost,
									format: new ol.format.GeoJSON()
	       						});
	
	
	// Anzahl akive Knote laden wenn Sources geladen sind.
	source_nodes.on('change', function(event)
	{
		if (source_nodes.getState() == 'ready') {
			$('.target-nodes-online').html(''); 
			$.ajax(
			{	
				type: 'GET',
				url: url_count_nodes,
				dataType: 'json'				
			}
			).done( function(data)
			{ 
				$( '.target-nodes-online' ).html(data); 
			});
		}
	});
	
	// Anzahl Clients laden
	$('.target-clients-online').html('');
	$.ajax(
	{	
		type: 'GET',
		url: url_count_clients,
		dataType: 'json'
	}
	).done( function(data) 
	{ 
		$( '.target-clients-online' ).html(data);
	});

	
	// Layer: Knoten
	var layer_nodes = new ol.layer.Vector(
	{	
        title: 'layer_nodes',
        source: source_nodes,
        style: function(feature)
        {
			if (feature.get('active') == true) { 
				if 		(feature.get('vpnActive') == true) 		{ var point_color = 'rgba(128, 255, 0, 1)'; }
				else if	(feature.get('gatewayQuality') > 200) 	{ var point_color = 'rgba(153, 204, 0, 1)'; }
				else if	(feature.get('gatewayQuality') > 100) 	{ var point_color = 'rgba(255, 215, 0, 1)'; }
				else 											{ var point_color = 'rgba(210, 105, 30, 1)'; }
				
				var point_stroke_color 	= 'rgba(0, 0, 0, 1)'; 
				var point_stroke_width 	= 1;
			} else { 				
				var point_color 		= 'rgba(255, 128, 0, 0.3)'; 
				var point_stroke_color 	= 'rgba(50, 50, 50, 0.8)';
				var point_stroke_width 	= 1;
			}
			
			style = [
	            new ol.style.Style(
	            {
    	        	image: new ol.style.Circle(
    	        	{
        	       		radius: 6,
						fill: new ol.style.Fill(
						{ 
							color: point_color 
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: point_stroke_color, 
							width: point_stroke_width 
						})
              		})
            	})
            ];
            
            return style;
          }
    });
    
    layer_nodes_text_clients_on = false;
    var layer_nodes_text_clients = new ol.layer.Vector(
	{	
        title: 'layer_nodes_text_clients',
        visible: false,
        source: source_nodes,
        style: function(feature)
        {
	        if (feature.get('active') == true) {
				if 		(feature.get('vpnActive') == true) 		{ var point_color = 'rgba(128, 255, 0, 1)'; }
				else if	(feature.get('gatewayQuality') > 200) 	{ var point_color = 'rgba(153, 204, 0, 1)'; }
				else if	(feature.get('gatewayQuality') > 100) 	{ var point_color = 'rgba(255, 215, 0, 1)'; }
				else 											{ var point_color = 'rgba(210, 105, 30, 1)'; }
		        
		        if 		(feature.get('clients') <= 5) 	{ var point_radius = 6; var point_stroke_color = '#808000'; var point_stroke_width = 1; }
				else if	(feature.get('clients') <= 10) 	{ var point_radius = 7; var point_stroke_color = '#808000'; var point_stroke_width = 3; }
				else if	(feature.get('clients') <= 20) 	{ var point_radius = 8; var point_stroke_color = '#FFA500'; var point_stroke_width = 4; }
				else								 	{ var point_radius = 9; var point_stroke_color = '#DC143C'; var point_stroke_width = 6; }
				
				var node_text_clients = feature.get('clients');
			} else {
				var point_radius = 6;
				var point_color 		= 'rgba(0, 0, 0, 0)'; 
				var point_stroke_color 	= 'rgba(0, 0, 0, 0)';
				var point_stroke_width 	= 1;
				var node_text_clients = '';
			}
	        
			style = [
	            new ol.style.Style(
	            {
    	        	image: new ol.style.Circle(
    	        	{
        	       		radius: point_radius,
						fill: new ol.style.Fill(
						{ 
							color: point_color
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: point_stroke_color, 
							width: point_stroke_width 
						})
	           		}),
              		text: new ol.style.Text(
					{
	                    textAlign: "left",
	                    textBaseline: "middle",
	                    font: 'normal 16px Roboto',
	                    text: node_text_clients,
	                    fill: new ol.style.Fill({
	                        color: '#F8F8FF'
	                    }),
	                    stroke: new ol.style.Stroke({
	                        color: '#515151',
	                        width: 5
	                    }),
	                    offsetX: 10,
	                    offsetY: 0,
	                    rotation: 0
	                })
            	})
            ];
            
            return style;
          }
    });
    
    layer_nodes_text_gatewayquality_on = false;
    var layer_nodes_text_gatewayquality = new ol.layer.Vector(
	{	
        title: 'layer_nodes_text_gatewayquality',
        visible: false,
        source: source_nodes,
        style: function(feature)
        {
	        if (feature.get('active') == true) {			
				if(feature.get('active') == true) { 
					if		(feature.get('vpnActive') == true) 		{ var gatewayQuality = Math.round((parseInt(feature.get('gatewayQuality')) * 100) / 255); }
					else if	(feature.get('gatewayQuality') == '0') 	{ var gatewayQuality = 0; }
					else 											{ var gatewayQuality = Math.round(((parseInt(feature.get('gatewayQuality')) + 15) * 100) / 255); }	
				} else { 
					var gatewayQuality = 0;
				}
				
				var node_text_gatewayquality = gatewayQuality + ' %'
			} else {
				var node_text_gatewayquality = '';
			}
	        
			style = [
	            new ol.style.Style(
	            {
    	        	image: new ol.style.Circle(
    	        	{
        	       		radius: 6,
						fill: new ol.style.Fill(
						{ 
							color: 'rgba(0, 0, 0, 0)'
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: 'rgba(0, 0, 0, 0)', 
							width: 1 
						})
	           		}),
              		text: new ol.style.Text(
					{
	                    textAlign: "right",
	                    textBaseline: "middle",
	                    font: 'normal 14px Roboto',
	                    text: node_text_gatewayquality,
	                    fill: new ol.style.Fill({
	                        color: '#F8F8FF'
	                    }),
	                    stroke: new ol.style.Stroke({
	                        color: '#515151',
	                        width: 5
	                    }),
	                    offsetX: -10,
	                    offsetY: 0,
	                    rotation: 0
	                })
            	})
            ];
            
            return style;
          }
    });
    
    layer_nodes_text_name_on = false;
    var layer_nodes_text_name = new ol.layer.Vector(
	{	
        title: 'layer_nodes_text_name',
        visible: false,
        source: source_nodes,
        style: function(feature)
        {
	        style = [
	            new ol.style.Style(
	            {
    	        	image: new ol.style.Circle(
    	        	{
        	       		radius: 6,
						fill: new ol.style.Fill(
						{ 
							color: 'rgba(0, 0, 0, 0)'
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: 'rgba(0, 0, 0, 0)', 
							width: 1 
						})
	           		}),
              		text: new ol.style.Text(
					{
	                    textAlign: "center",
	                    textBaseline: "bottom",
	                    font: 'normal 14px Roboto',
	                    text: feature.get('name'),
	                    fill: new ol.style.Fill({
	                        color: '#F8F8FF'
	                    }),
	                    stroke: new ol.style.Stroke({
	                        color: '#515151',
	                        width: 5
	                    }),
	                    offsetX: 0,
	                    offsetY: -10,
	                    rotation: 0
	                })
            	})
            ];
            
            return style;
          }
    });
    
    layer_nodes_text_firmware_on = false;
    var layer_nodes_text_firmware = new ol.layer.Vector(
	{	
        title: 'layer_nodes_text_firmware',
        visible: false,
        source: source_nodes,
        style: function(feature)
        {
	        style = [
	            new ol.style.Style(
	            {
    	        	image: new ol.style.Circle(
    	        	{
        	       		radius: 6,
						fill: new ol.style.Fill(
						{ 
							color: 'rgba(0, 0, 0, 0)'
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: 'rgba(0, 0, 0, 0)', 
							width: 1 
						})
	           		}),
              		text: new ol.style.Text(
					{
	                    textAlign: "center",
	                    textBaseline: "top",
	                    font: 'normal 14px Roboto',
	                    text: feature.get('firmwareBuild'),
	                    fill: new ol.style.Fill({
	                        color: '#F8F8FF'
	                    }),
	                    stroke: new ol.style.Stroke({
	                        color: '#515151',
	                        width: 5
	                    }),
	                    offsetX: 0,
	                    offsetY: 10,
	                    rotation: 0
	                })
            	})
            ];
            
            return style;
          }
    });
    
    var layer_nodes_new_on = false;
    var layer_nodes_new = new ol.layer.Vector(
    {	
        title: 'layer_nodes_new',
        visible: false,
        source: source_nodes_new,
        style: function(feature)
        {
			var point_color 		= 'rgba(0, 191, 255, 1)';
			
			var point_stroke_color 	= 'rgba(0, 0, 0, 1)'; 
			var point_stroke_width 	= 1;
			
			style = [
	            new ol.style.Style(
	            {
    	        	image: 	new ol.style.Circle(
					{
        	        	radius: 6,
						fill: new ol.style.Fill(
						{
							color: point_color 
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: point_stroke_color, 
							width: point_stroke_width 
						})
              		})
            	})
            ];
            
            return style;
          }
    });
    
    var layer_nodes_lost_on = false;
    var layer_nodes_lost = new ol.layer.Vector(
    {	
        title: 'layer_nodes_lost',
        visible: false,
        source: source_nodes_lost,
        style: function(feature)
        {
			if		(feature.get( 'lastSeenDays' ) < 40) 	{ var point_color = 'rgba(255, 0, 0, 0.8)'; }
			else if	(feature.get( 'lastSeenDays' ) < 180) 	{ var point_color = 'rgba(255, 131, 250, 0.8)'; }
			else if	(feature.get( 'lastSeenDays' ) < 365) 	{ var point_color = 'rgba(255, 131, 250, 0.5)'; }
			else 	   										{ var point_color = 'rgba(255, 131, 250, 0.3)'; }
			
			var point_stroke_color = 'rgba(0, 0, 0, 1)'; 
			var point_stroke_width = 1;
			
			style = [
	            new ol.style.Style(
	            {
    	        	image: 	new ol.style.Circle(
    	        	{
        	        	radius: 6,
						fill: new ol.style.Fill(
						{ 
							color: point_color 
						}),
						stroke: new ol.style.Stroke(
						{ 
							color: point_stroke_color, 
							width: point_stroke_width 
						})
              		})
            	})
            ];
            
            return style;
          }
    });
    
    
    // Layer: Reichweite
    var layer_nodes_range = new ol.layer.Vector(
    {	
        title: 'layer_nodes_range',
        visible: false,
        source: source_nodes,
        style: function(feature, resolution)
        {	          
			if (debug_on) {
				console.log('resolution = '+ resolution)
			}
           
			style = [
	            new ol.style.Style(
	            {
    	        	image: 	new ol.style.Circle(
    	        	{
        	        	radius: 35 * (1/resolution),
						fill: new ol.style.Fill(
						{ 
							color: 'rgba(153, 204, 255, 0.3)'
						})
              		})
            	})
            ];
            
            return style;
       }
    });
    
    
    // Layer: Meshlinks
    var layer_meshlinks = new ol.layer.Vector({
	    
        title: 'layer_meshlinks',
        source: source_meshlinks,
        style: function(feature)
        {
	        if		(feature.get('linkQuality') < 1.2) 	{ var link_color = 'rgba(128, 255, 0, 0.9)'; } 
	        else if	(feature.get('linkQuality') < 1.4) 	{ var link_color = 'rgba(178, 255, 102, 0.8)'; }
            else if	(feature.get('linkQuality') < 1.8) 	{ var link_color = 'rgba(255, 255, 0, 0.7)'; }
            else if	(feature.get('linkQuality') < 2.5) 	{ var link_color = 'rgba(255, 255, 102, 0.6)'; }
            else if	(feature.get('linkQuality') < 3.0) 	{ var link_color = 'rgba(255, 128, 0, 0.5)'; }
            else if	(feature.get('linkQuality') < 5.0) 	{ var link_color = 'rgba(255, 178, 102, 0.4)'; }
            else 	   								   	{ var link_color = 'rgba(255, 0, 0, 0.3)'; }
                   
            style = [
            	new ol.style.Style(
				{
                	stroke: new ol.style.Stroke(
                	{
	                  	color: link_color,
						width: 2
                    })
                })
            ];
            
            return style;
        },
        maxResolution: 3
        
    });
	
	
	// Kartenlayer
	var layer_active = 'OSM';
	
	var layer_map_openstreetmap = new ol.layer.Tile({ 
		source: new ol.source.OSM() 
	});
	
	if (typeof(key_bing) != 'undefined') {
		// Bing Layer können nur bei gültigem Bing-API-Key angezeigt werden.
		
		var layer_map_bing_satellite = new ol.layer.Tile({
			visible: false,
		    source: new ol.source.BingMaps({
		    	key: key_bing,
				imagerySet: 'Aerial',
				maxZoom: 19
		    })
		});
		
		var layer_map_bing_hybrid = new ol.layer.Tile({
			visible: false,
		    source: new ol.source.BingMaps({
		    	key: key_bing,
				imagerySet: 'AerialWithLabels',
				maxZoom: 19
		    })
		});
		
		var layer_map_bing_road = new ol.layer.Tile({
			visible: false,
		    source: new ol.source.BingMaps({
		    	key: key_bing,
				imagerySet: 'Road',
				maxZoom: 19
		    })
		});
	} else {
		$('#trigger-layer-bing-satellite').remove();
		$('#trigger-layer-bing-hybrid').remove();
		$('#trigger-layer-bing-road').remove();
		
		var layer_map_bing_satellite = new ol.layer.Tile({ 
			visible: false,
			source: new ol.source.OSM() 
		});
		
		var layer_map_bing_hybrid = new ol.layer.Tile({ 
			visible: false,
			source: new ol.source.OSM() 
		});
		
		var layer_map_bing_road = new ol.layer.Tile({ 
			visible: false,
			source: new ol.source.OSM() 
		});
	}
	
	var layer_map_stamen_watercolor = new ol.layer.Tile({
		visible: false,
	    source: new ol.source.Stamen({
			layer: 'watercolor',
			maxZoom: 19
	    })
	});
	
	var layer_map_stamen_toner = new ol.layer.Tile({
		visible: false,
	    source: new ol.source.Stamen({
			layer: 'toner',
			maxZoom: 19
	    })
	});
	
	var layer_map_mapquest_road = new ol.layer.Tile({
		visible: false,
	    source: new ol.source.MapQuest({
			layer: 'osm',
			maxZoom: 19
	    })
	});
	
	
	// "Dimmer" Layer
	var dimmer_on = false;
	var source_dimmer = new ol.source.Vector(
	{	
		features: (new ol.format.GeoJSON().readFeatures(
		{
		   'type': 'FeatureCollection',
   		   'features': [{
			   	'type': 'Feature',
			   	"geometry": {
			   	    "type": "Polygon",
			   	    "crs": "EPSG:3857",
			   	    "coordinates": [[[-4e6, 4e6], [-4e6, 8e6], [4e6, 8e6], [4e6, 4e6], [-4e6, 4e6]]]
  			   	}
  			}]
  		}))
	});
	
	var layer_dimmer = new ol.layer.Vector(
	{
		title: 'layer_dimmer',
		visible: false,
		source: source_dimmer,
		style: new ol.style.Style(
		{	
			fill: new ol.style.Fill(
			{
      			color: 'rgba(0, 0, 0, 0.3)'
    		})
  		}),
	});
	
	
	// Geöffneten Node markieren
	var marker_node_visible = false;
	var source_marker_node_open = new ol.source.Vector();
	var layer_marker_node_open = new ol.layer.Vector(
	{
		title: 'layer_marker_node_open',
		visible: true,
		source: source_marker_node_open,
		style: new ol.style.Style(
	    {
    	 	image: 	new ol.style.Circle(
		 	{
            	radius: 15,
				fill: new ol.style.Fill(
				{ 
		 			color: 'rgba(255, 127, 80, 0.5)'
		 		})
        	})
        })
	});
	
	
	// Karte zeichnen
	var map = new ol.Map(
	{ 
	    target: 'vfnnrw-map',
	    controls: ol.control.defaults(
		{
			attributionOptions: (
			{
				callapsible: true,
				collapsed: true
			})
		}),
	    layers: [
		    layer_map_openstreetmap,
		    layer_map_bing_satellite,
		    layer_map_bing_hybrid,
		    layer_map_bing_road,
		    layer_map_stamen_watercolor,
		    layer_map_stamen_toner,
		    layer_map_mapquest_road,
		    layer_dimmer,
		    layer_nodes_range,
		    layer_meshlinks,
		    layer_marker_node_open,
		    layer_nodes,
		    layer_nodes_text_clients,
		    layer_nodes_text_gatewayquality,
		    layer_nodes_text_name,
		    layer_nodes_text_firmware,
		    layer_nodes_lost,
		    layer_nodes_new
		],
	    view: new ol.View({
	    	center: ol.proj.transform( [coords_map_lon, coords_map_lat], 'EPSG:4326', 'EPSG:3857' ),
	        zoom: zoom_map
	    })
	});
	
	
	// Popup initialisieren
	var element = document.getElementById('popup');
	var popup = new ol.Overlay(
	{
		element: element,
		positioning: 'bottom-center',
		stopEvent: false
	});
	map.addOverlay(popup);


	// Clicks auf Features
	map.on('singleclick', function(event)
	{
		if (debug_on) {
			console.log(
				'map "singleclick"'
			);
		}
		
		$(element).popover('destroy');
	
		var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) 
		{ 	
			if (layer.j.title == 'layer_dimmer') { return false; }
			return feature; 	
		});

		if (feature) {
			
			if (debug_on) {
				console.log(
					'"feature" triggered'
				);
			}
		
			if (feature.get('linkQuality') != undefined) {
				// Popup für Meshlinks
				
				if (debug_on) {
					console.log(
						'"feature" | "linkQuality" is not undefined'
					);
				}
			
				var coord = event.coordinate;
				var transCoord = ol.proj.transform(coord, "EPSG:900913", "EPSG:3857");
				
				if		(feature.get('linkQuality') < 1.9) 	{ var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 100 ) / 2 ); } 
				else if	(feature.get('linkQuality') < 2.9) 	{ var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 200 ) / 4 ) + 50; }
				else if	(feature.get('linkQuality') < 3.9) 	{ var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 300 ) / 8 ) + 75; }
				else if	(feature.get('linkQuality') < 4.9) 	{ var linkQualityFactor = ((( feature.get('linkQuality') * 100 ) - 400 ) / 16 ) + 87.5; }
				else 										{ var linkQualityFactor = 100; }
				
				var linkQuality = 100 - Math.round(linkQualityFactor);
				
				popup.setPosition(transCoord);
				$(element).popover(
				{	
					'placement': 'top',
					'html': true,
					'title': 'Linkqualität: ' + linkQuality + '%' ,
					'content': 	'<p>Linkqualität (RAW): ' + feature.get('linkQuality') +
								'<p>Von: <span class="details-trigger" rel="' + feature.get ('FromID') + '">' + feature.get ('FromName') + ' (' + feature.get ('FromID') + ')</span></p>' +
								'<p>Zu: <span class="details-trigger" rel="' + feature.get ('ToID') + '">' + feature.get ('ToName') + ' (' + feature.get ('ToID') + ')</span></p>' +
								'<p>Länge: ' + feature.get ('lengthInMeters') + ' Meter</p>',
				});
	
				$(element).popover('show');
				$('.details-trigger').click( function() { 
					var node_id = $(this).attr('rel');
					
					$.ajax(
					{	
						type: 'GET',
						url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/' + node_id,
						dataType: 'json'
					}
					).done( function(node) 
					{ 	
						var node_position = new ol.proj.transform([parseFloat(node.Longitude), parseFloat(node.Latitude)], 'EPSG:4326', 'EPSG:3857');
						
						source_marker_node_open.clear();
						var feature_node_marker = new ol.Feature({
							geometry: new ol.geom.Point(node_position),
							name: 'node_open_marker'
						});
							
						source_marker_node_open.addFeature(feature_node_marker);
						marker_node_visible = true;
					});
					
					node_details(node_id); 
				}); 
			} else if (feature.get('id') != undefined) {
				// Popup für Knoten
				
				var geometry = feature.getGeometry();
				var coord = geometry.getCoordinates();
				
				if(feature.get('active') == true) { 
					if		(feature.get('vpnActive') == true) 		{ var gatewayQuality = Math.round((parseInt(feature.get('gatewayQuality')) * 100) / 255); }
					else if	(feature.get('gatewayQuality') == '0') 	{ var gatewayQuality = 0; }
					else 											{ var gatewayQuality = Math.round(((parseInt(feature.get('gatewayQuality')) + 15) * 100) / 255); }	
				} else { 
					var gatewayQuality = 0;
				}
				
				if (feature.get('vpnActive') == true && feature.get('active') == true) { 
					var uplink = ' / Uplink aktiv'; 
				} else { 
					var uplink = '';
				}
				
				popup.setPosition(coord);
				$(element).popover(
				{
					'placement': 'top',
					'html': true,
					'title': feature.get('name') + ' (' + feature.get('id') + ')',
					'content': 	'<p><b>Clients:</b> ' + feature.get('clients') + '</p>' +
								'<p><b>Verbindungsqualit&auml;t:</b> ' + gatewayQuality + ' %' + uplink + '</p>' +
								'<p><b>Letzter Gatewaykontakt:</b> ' + feature.get('lastSeen') + '</p>' +
								'<p>vor ' + feature.get('lastSeenDifference') + '</p>' +
								'<p><b>Firmware:</b> ' + feature.get('firmwareBuild') + '</p>' +
								'<p><span class="details-trigger" rel="' + feature.get('id') + '">Details</a></p>',
				});
	
				$(element).popover('show');
				$('.details-trigger').click( function() 
				{ 
					if (debug_on) {
						console.log(feature.getGeometry().getCoordinates());
					}
					
					source_marker_node_open.clear();
					var feature_node_marker = new ol.Feature({
						geometry: new ol.geom.Point( feature.getGeometry().getCoordinates() ),
						name: 'node_open_marker'
					});
					
					source_marker_node_open.addFeature(feature_node_marker);
					marker_node_visible = true;
					
					node_details($(this).attr('rel'));
				}); 
			}		
		} else {
			// Popup bei jedem Klick auflösen, da es sich nicht aktualisieren lässt.
			
			$(element).popover('destroy');
		}
	});
	
	
	// Cursorbewegung
	var target = map.getTarget();
	var jTarget = typeof target === 'string' ? $( '#' + target ) : $(target);
	map.on('pointermove', function(e)
	{	
		if (e.dragging) 
		{
			// Popup bei Änderung des Kartenausschitts auflösen
			
			$(element).popover( 'destroy' );
			return;
		}
		
		var mouseCoordInMapPixels = [e.originalEvent.offsetX, e.originalEvent.offsetY];
	    var hit = map.forEachFeatureAtPixel(mouseCoordInMapPixels, function (feature, layer)
	    { 
		    // Cursortreffer für Feature ermitteln, außer es handelt sich um den Dimmerlayer
		    
		    if (layer.j.title == 'Dimmer') { return false; }
		    return true; 
		});

		// Cursor in Pointer umwandeln um auf Aktion hinzuweisen
	    if (hit) { 
		    jTarget.css('cursor', 'pointer'); 
		} else { 
			jTarget.css( 'cursor', '' ); 
		}
	    
	    // Cursorposition anzeigen
	    var geocoords =  ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
	    if (geocoordsAllowChangeON == true) {
	    	$( '#target-lat' ).html(geocoords[1]);
			$( '#target-lon' ).html(geocoords[0]);
		}	
	});
	
	
	// Browserzeile anpassen
	map.on('moveend', function()
	{
		var actual_center 	= ol.proj.transform(map.getView().getCenter(), 'EPSG:3857', 'EPSG:4326' );
		var new_url_params 	= '?' + actual_center[0] + '-' + actual_center[1] + '-' + map.getView().getZoom();
		
		param_node_id = '';
		if (nodes_open) {
			open_node_id = parseInt($('#node-id').html());
			param_node_id = '-'+ open_node_id;
		}	
		
		window.history.pushState(
			{ urlPath:  new_url_params + param_node_id}, 
			'', 
			new_url_params + param_node_id
		);					
	});
	
	
	// ========== CONTROLS ==========
	
	// Standort ermitteln
	var location = new ol.Geolocation(
	{
		projection: map.getView().getProjection()
	});
	
	$('#trigger-locate').click( function()
	{ 
		if (location.getTracking() == false) {
			location.setTracking(true);	
		}
		
		if(location.getPosition() != undefined) {
			map.getView().setCenter(location.getPosition());
			map.getView().setZoom(18);
		}
	});
	
	
	// Zeigerkoordinaten anzeigen
	var geocoordsAllowChangeON = true;
		
	$(document).keydown( function(e) 
	{
		var key = String.fromCharCode( e.keyCode );
		key.toUpperCase();
 
		if (key == 'L' && geocoordsAllowChangeON == true) { 
			geocoordsAllowChangeON = false;
			$('#cursor-position #locked').html( '<i class="fa fa-lock"></i> Koordinaten fixiert' );
		} else if (key == 'L' && geocoordsAllowChangeON == false) {
			geocoordsAllowChangeON = true;
			$('#cursor-position #locked').html( '<i class="fa fa-unlock"></i> Koordinaten frei' );
		}
	});
	
	
	// Kartenlayer wechseln
	$('#trigger-layer-osm').click( function() 
	{
		layer_map_openstreetmap.setVisible(true);
		layer_map_bing_satellite.setVisible(false);
		layer_map_bing_hybrid.setVisible(false); 
		layer_map_bing_road.setVisible(false);
		layer_map_stamen_watercolor.setVisible(false);
		layer_map_stamen_toner.setVisible(false);
		layer_map_mapquest_road.setVisible(false);
		
		$(this).addClass('active');
		$('#icon-osm').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-bing-satellite').removeClass('active');
		$('#icon-bing-satellite').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-hybrid').removeClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-road').removeClass('active');
		$('#icon-bing-road').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-watercolor').removeClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-toner').removeClass('active');
		$('#icon-stamen-toner').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-mapquest-road').removeClass('active');
		$('#icon-mapquest-road').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	$('#trigger-layer-bing-satellite').click( function() 
	{
		layer_map_openstreetmap.setVisible(false);
		layer_map_bing_satellite.setVisible(true);
		layer_map_bing_hybrid.setVisible(false); 
		layer_map_bing_road.setVisible(false);
		layer_map_stamen_watercolor.setVisible(false);
		layer_map_stamen_toner.setVisible(false);
		layer_map_mapquest_road.setVisible(false);
		
		$(this).addClass('active');
		$('#icon-bing-satellite').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-osm').removeClass('active');
		$('#icon-osm').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-hybrid').removeClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-road').removeClass('active');
		$('#icon-bing-road').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-watercolor').removeClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-toner').removeClass('active');
		$('#icon-stamen-toner').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-mapquest-road').removeClass('active');
		$('#icon-mapquest-road').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	$('#trigger-layer-bing-hybrid').click( function() 
	{
		layer_map_openstreetmap.setVisible(false);
		layer_map_bing_satellite.setVisible(false);
		layer_map_bing_hybrid.setVisible(true); 
		layer_map_bing_road.setVisible(false);
		layer_map_stamen_watercolor.setVisible(false);
		layer_map_stamen_toner.setVisible(false);
		layer_map_mapquest_road.setVisible(false);
		
		$(this).addClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-osm').removeClass('active');
		$('#icon-osm').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-satellite').removeClass('active');
		$('#icon-bing-satellite').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-road').removeClass('active');
		$('#icon-bing-road').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-watercolor').removeClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-mapquest-road').removeClass('active');
		$('#icon-mapquest-road').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	$('#trigger-layer-bing-road').click( function() 
	{
		layer_map_openstreetmap.setVisible(false);
		layer_map_bing_satellite.setVisible(false);
		layer_map_bing_hybrid.setVisible(false); 
		layer_map_bing_road.setVisible(true);
		layer_map_stamen_watercolor.setVisible(false);
		layer_map_stamen_toner.setVisible(false);
		layer_map_mapquest_road.setVisible(false);
		
		$(this).addClass('active');
		$('#icon-bing-road').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-osm').removeClass('active');
		$('#icon-osm').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-satellite').removeClass('active');
		$('#icon-bing-satellite').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-hybrid').removeClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-watercolor').removeClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-toner').removeClass('active');
		$('#icon-stamen-toner').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-mapquest-road').removeClass('active');
		$('#icon-mapquest-road').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	$('#trigger-layer-stamen-watercolor').click( function() 
	{
		layer_map_openstreetmap.setVisible(false);
		layer_map_bing_satellite.setVisible(false);
		layer_map_bing_hybrid.setVisible(false); 
		layer_map_bing_road.setVisible(false);
		layer_map_stamen_watercolor.setVisible(true);
		layer_map_stamen_toner.setVisible(false);
		layer_map_mapquest_road.setVisible(false);
		
		$(this).addClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-osm').removeClass('active');
		$('#icon-osm').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-satellite').removeClass('active');
		$('#icon-bing-satellite').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-hybrid').removeClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-road').removeClass('active');
		$('#icon-bing-road').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-toner').removeClass('active');
		$('#icon-stamen-toner').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-mapquest-road').removeClass('active');
		$('#icon-mapquest-road').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	$('#trigger-layer-stamen-toner').click( function() 
	{
		layer_map_openstreetmap.setVisible(false);
		layer_map_bing_satellite.setVisible(false);
		layer_map_bing_hybrid.setVisible(false); 
		layer_map_bing_road.setVisible(false);
		layer_map_stamen_watercolor.setVisible(false);
		layer_map_stamen_toner.setVisible(true);
		layer_map_mapquest_road.setVisible(false);
		
		$(this).addClass('active');
		$('#icon-stamen-toner').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-osm').removeClass('active');
		$('#icon-osm').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-satellite').removeClass('active');
		$('#icon-bing-satellite').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-hybrid').removeClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-road').removeClass('active');
		$('#icon-bing-road').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-watercolor').removeClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-mapquest-road').removeClass('active');
		$('#icon-mapquest-road').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	$('#trigger-layer-mapquest-road').click( function() 
	{
		layer_map_openstreetmap.setVisible(false);
		layer_map_bing_satellite.setVisible(false);
		layer_map_bing_hybrid.setVisible(false); 
		layer_map_bing_road.setVisible(false);
		layer_map_stamen_watercolor.setVisible(false);
		layer_map_stamen_toner.setVisible(false);
		layer_map_mapquest_road.setVisible(true);
		
		$(this).addClass('active');
		$('#icon-mapquest-road').addClass('fa-eye').removeClass('fa-eye-slash');
		
		$('#trigger-layer-osm').removeClass('active');
		$('#icon-osm').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-satellite').removeClass('active');
		$('#icon-bing-satellite').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-hybrid').removeClass('active');
		$('#icon-bing-hybrid').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-bing-road').removeClass('active');
		$('#icon-bing-road').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-watercolor').removeClass('active');
		$('#icon-stamen-watercolor').addClass('fa-eye-slash').removeClass('fa-eye');
		$('#trigger-layer-stamen-toner').removeClass('active');
		$('#icon-stamen-stamen-toner').addClass('fa-eye-slash').removeClass('fa-eye');
	});
	
	
	// "Dimmer" an/aus
	$('#trigger-dimmer').click( function()
	{
		if (debug_on) {
			console.log(
				'Click "trigger-dimmer" | dimmer_on = '+ dimmer_on
			);
		}
		
		if (dimmer_on == false) { 
			layer_dimmer.setVisible(true); 
			$(this).addClass('active');
			dimmer_on = true; 
		} else { 
			layer_dimmer.setVisible(false); 
			$(this).removeClass('active');
			dimmer_on = false; 
		}
	});
	
	
	// Reichweite an/aus
	range_on = false;
	$('#trigger-range').click( function()
	{
		if (debug_on) {
			console.log(
				'Click "trigger-range" | range_on = '+ range_on
			);
		}
		
		if (range_on == false) { 
			layer_nodes_range.setVisible(true); 
			$(this).addClass('active');
			range_on = true; 
		} else { 
			layer_nodes_range.setVisible(false); 
			$(this).removeClass('active');
			range_on = false; 
		}
	});
	
	
	// Neue Knoten anzeigen
	$('#trigger-nodes-new').click( function()
	{
		if (layer_nodes_new_on == false) {
			layer_nodes_new_on = true;
			layer_nodes_new.setVisible(true);
			$(this).addClass('active');
		} else {
			layer_nodes_new_on = false;
			layer_nodes_new.setVisible(false);
			$(this).removeClass('active');
		}
	});
	
	
	// "Verlorene" Knoten anzeigen
	$('#trigger-nodes-lost').click( function()
	{
		if (layer_nodes_lost_on == false) {
			layer_nodes_lost_on = true;
			layer_nodes_lost.setVisible(true);
			$(this).addClass('active');
		} else {
			layer_nodes_lost_on = false;
			layer_nodes_lost.setVisible(false);
			$(this).removeClass('active');
		}
	});
	
	
	// Clientanzahl anzeigen
	$('#trigger-nodes-text-clients').click( function()
	{
		if (layer_nodes_text_clients_on == false) {
			layer_nodes_text_clients_on = true;
			layer_nodes_text_clients.setVisible(true);
			$(this).addClass('active');
		} else {
			layer_nodes_text_clients_on = false;
			layer_nodes_text_clients.setVisible(false);
			$(this).removeClass('active');
		}
	});


	// Gatewayqualität anzeigen
	$('#trigger-nodes-text-gatewayquality').click( function()
	{
		if (layer_nodes_text_gatewayquality_on == false) {
			layer_nodes_text_gatewayquality_on = true;
			layer_nodes_text_gatewayquality.setVisible(true);
			$(this).addClass('active');
		} else {
			layer_nodes_text_gatewayquality_on = false;
			layer_nodes_text_gatewayquality.setVisible(false);
			$(this).removeClass('active');
		}
	});	
	
	
	// Namen anzeigen
	$('#trigger-nodes-text-name').click( function()
	{
		if (layer_nodes_text_name_on == false) {
			layer_nodes_text_name_on = true;
			layer_nodes_text_name.setVisible(true);
			$(this).addClass('active');
		} else {
			layer_nodes_text_name_on = false;
			layer_nodes_text_name.setVisible(false);
			$(this).removeClass('active');
		}
	});	
	
	
	// Firmware anzeigen
	$('#trigger-nodes-text-firmware').click( function()
	{
		if (layer_nodes_text_firmware_on == false) {
			layer_nodes_text_firmware_on = true;
			layer_nodes_text_firmware.setVisible(true);
			$(this).addClass('active');
		} else {
			layer_nodes_text_firmware_on = false;
			layer_nodes_text_firmware.setVisible(false);
			$(this).removeClass('active');
		}
	});	
	
	
	// Adresse suchen
	$("#form-address").submit( function (event) 
	{	
		event.preventDefault();		
		var address = $('#input-address').val();
		get_coords(address);	
	});
	
	$("#trigger-address-search").click( function () 
	{	
		var address = $('#input-address').val();
		get_coords(address);	
	});
	
	// Koordinaten bei Google ermitteln und darauf zoomen.
	// Funktion kann nicht ausgelagert werden, da sonst kein Zugriff auf "map" mehr möglich ist.
	function get_coords(address)
	{
		var query = $.ajax(
		{	
			type: 'GET',
			url: 'http://maps.google.com/maps/api/geocode/json',
			dataType: 'json',
			data:
			{
	        	address: address,
	            sensor: 'true'
	        }
		}).done( function(data)
		{	
			var lat = data.results[0].geometry.location.lat;
			var lng = data.results[0].geometry.location.lng;
			var address_position = new ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857');
			
			map.getView().setCenter(address_position);
			map.getView().setZoom(17);
			
			$('#input-address').val('');		
		});	
	}
	
	
	// Karte manuell aktualisieren
	$('#trigger-refresh').click( function()
	{ 
		if (debug_on) {
			console.log('map_refesh()');
		}
		map_refresh(); 
	});
	
	
	// Karte automatisch 1 mal pro Minute aktualisieren
	var map_autorefresh_on = false;
	$('#trigger-autorefresh').click( function() 
	{ 
		if (map_autorefresh_on == false) { 
			$('#trigger-autorefresh').find('i').addClass('fa-pulse');
			map_autorefresh_on = true;
		} else {
			$('#trigger-autorefresh').find('i').removeClass('fa-pulse');
			map_autorefresh_on = false;
		}
		
		window.setInterval( function() 
		{
			if (debug_on) {
				console.log('map_refesh()');
			}
			
			if(map_autorefresh_on == true) { 
				mapRefresh(); 
			}
	    }, 60000);
	});
	
	// Karte alle 10 Minuten aktualisieren
	window.setInterval( function() 
	{
		if (debug_on) {
			console.log('map_refesh()');
		}
		
		map_refresh();
	}, 600000);
	
	
	// Karte aktualisieren
	// Funktion kann nicht ausgelagert werden, da sonst kein Zugriff auf "map" mehr möglich ist.
	function map_refresh()
	{	
		// Knoten
		source_nodes.clear(true);
		$.ajax(
		{
			type: 'GET',
			url: url_geo_nodes,
			dataType: 'json'
		}
		).done( function(data)
		{ 	
			var features = new ol.format.GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" });
			source_nodes.addFeatures(features);	
		});
		
		// Meshlinks
		source_meshlinks.clear(true);
		$.ajax(
		{
			type: 'GET',
			url: url_geo_meshlinks,
			dataType: 'json'
		}
		).done( function(data)
		{ 
			var features = new ol.format.GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" });
			source_meshlinks.addFeatures(features);
		});
		
		// Neue Knoten
		source_nodes_new.clear(true);
		$.ajax({
		
			type: 'GET',
			url: url_geo_nodes_new,
			dataType: 'json'
		}
		).done( function(data)
		{ 
			var features = new ol.format.GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" } );
			source_nodes_new.addFeatures(features);
		});
		
		// Verlorene Knoten
		source_nodes_lost.clear(true);
		$.ajax({
			type: 'GET',
			url: url_geo_nodes_lost,
			dataType: 'json'
		}
		).done( function(data)
		{ 
			var features = new ol.format.GeoJSON().readFeatures(data, { featureProjection: "EPSG:3857" });
			source_nodes_lost.addFeatures(features);
		});
		
		// Karte neu zeichnen
		map.render();
		
		// Statistik laden
		$('.target-nodes-online').html(''); 
		$.ajax(
		{	
			type: 'GET',
			url: url_count_nodes,
			dataType: 'json'				
		}
		).done( function(data)
		{ 
			$( '.target-nodes-online' ).html(data); 
		});
		
		$('.target-clients-online').html('');
		$.ajax(
		{	
			type: 'GET',
			url: url_count_clients,
			dataType: 'json'
		}
		).done( function(data) 
		{ 
			$( '.target-clients-online' ).html(data);
		});
	}
	
	
	// Zum Knoten zoomen
	$('#trigger-locate-node').click( function()
	{	
		if (get_url_param('node_id') != null ) { 
			var locate_node_id = get_url_param('node_id');
		
			$.ajax(
			{	
				type: 'GET',
				url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/' + locate_node_id,
				dataType: 'json'
			}
			).done( function(node) 
			{ 	
				var node_position = new ol.proj.transform([parseFloat(node.Longitude), parseFloat(node.Latitude)], 'EPSG:4326', 'EPSG:3857');
				map.getView().setCenter(node_position);
				map.getView().setZoom(19);
			});
		}
	});
	
	
	// Marker geöffneter Nodes entfernen
	$('#nodes__toggle').click( function()
	{
		if (! nodes_open) {
			source_marker_node_open.clear();
			marker_node_visible = false;
		}
		
		if (nodes_open) {
			var locate_node_id = get_url_param('node_id');
			
			$.ajax(
			{	
				type: 'GET',
				url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/' + locate_node_id,
				dataType: 'json'
			}
			).done( function(node) 
			{ 	
				var node_position = new ol.proj.transform([parseFloat(node.Longitude), parseFloat(node.Latitude)], 'EPSG:4326', 'EPSG:3857');
				
				source_marker_node_open.clear();
				var feature_node_marker = new ol.Feature({
					geometry: new ol.geom.Point(node_position),
					name: 'node_open_marker'
				});
					
				source_marker_node_open.addFeature(feature_node_marker);
				marker_node_visible = true;
			});
		}
	});
	
	
	// Statistik einblenden
	$('#trigger-stats').click( function()
	{
		$.ajax(
		{
			type: 'GET',
			url: url_statistics,
			dataType: 'json'
		}
		).done( function(data) 
		{		
			var count_gluon = 0;
			var data_gluon = new Array();
			var count_pregluon = 0;
			var data_pregluon = new Array();
			$.each(data.FirmwareVersionsCounts, function(i, object)
			{
				if (i.charAt(0) == '0') {
					count_gluon = count_gluon + parseInt(object);
					name = i;
					nodes = parseFloat(object);
					data_gluon.push([name, nodes]);
				} else {
					count_pregluon = count_pregluon + parseInt(object);
					name = i;
					nodes = parseFloat(object);
					data_pregluon.push([name, nodes]);
				}
 			});
			
			$('#modal-stats').modal('show');
			
			$('#modal-stats').on('shown.bs.modal', function (e) 
			{				
				$('#target-highcharts-nodes').highcharts({
			        chart: {
			            type: 'column'
			        },
			        title: {
			            text: 'Knoten'
			        },
			        subtitle: {
			            text: null
			        },
			        xAxis: {
			            type: 'category'
			        },
			        yAxis: {
			            min: 0,
			            title: {
			                text: null
			            }
			        },
			        legend: {
			            enabled: false
			        },
			        plotOptions: {
			            series: {
			                borderWidth: 0,
			                dataLabels: {
			                    enabled: false,
			                    format: '{point.y:.1f}'
			                }
			            }
			        },
			        tooltip: {
				        enabled: false
			        },
			        
			        series: [{
			            name: "Knoten",
			            colorByPoint: true,
			            data: [{
			                name: "Knoten gesamt",
			                y: parseInt(data.NodesTotal)
			            }, {
			                name: "Knoten bereinigt *",
			                y: parseInt(data.NodesPurged)
			            }, {
			                name: "Knoten aktiv",
			                y: parseInt(data.NodesActive)
			            }, {
			                name: "Knoten aktiv mit Uplink",
			                y: parseInt(data.NodesActiveWithUplink)
			            }, {
			                name: "Knoten aktiv ohne Uplink",
			                y: parseInt(data.NodesActiveJustMesh)
			            }, {
			                name: "Versteckte aktive Knoten",
			                y: parseInt(data.NodesActiveNotOnMap)
			            }],
			            dataLabels: {
			                enabled: true,
			                rotation: 0,
			                color: '#000000',
			                align: 'center',
			                format: '{point.y:.0f}', // one decimal
			                y: 30, // 10 pixels down from the top
			                style: {
			                    fontSize: '13px',
			                    fontFamily: 'Verdana, sans-serif'
			                }
			            }
			        }],
			    });
				
				$('#target-highcharts-firmware').highcharts({
			        chart: {
			            type: 'column'
			        },
			        title: {
			            text: 'Firmwareversionen'
			        },
			        subtitle: {
			            text: 'Für Details auf die Balken klicken'
			        },
			        xAxis: {
			            type: 'category'
			        },
			        yAxis: {
			            title: {
			                text: null
			            }
			
			        },
			        legend: {
			            enabled: false
			        },
			        plotOptions: {
			            series: {
			                borderWidth: 0,
			                dataLabels: {
			                    enabled: false,
			                    format: '{point.y:.1f}'
			                }
			            }
			        },
					
			        series: [{
			            name: "Versionen",
			            colorByPoint: true,
			            data: [{
			                name: "Gluon",
			                y: count_gluon,
			                drilldown: "Gluon"
			            }, {
			                name: "Pre-Gluon",
			                y: count_pregluon,
			                drilldown: "Pre-Gluon"
			            }],
			            dataLabels: {
			                enabled: true,
			                rotation: 0,
			                color: '#000000',
			                align: 'center',
			                format: '{point.y:.0f}', // one decimal
			                y: 30, // 10 pixels down from the top
			                style: {
			                    fontSize: '13px',
			                    fontFamily: 'Verdana, sans-serif'
			                }
			            }
			        }],
			        
			        drilldown: {
			            series: [{
			                name: "Gluon",
			                id: "Gluon",
			                data: data_gluon
			            }, {
			                name: "Pre-Gluon",
			                id: "Pre-Gluon",
			                data: data_pregluon
			            }]
			        }
			    });    
			})
		});
	});
});