function node_details(node_id)
{	
	$.ajax(
	{
		type: 'GET',
		url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/' + node_id,
		nodeType: 'json'	
	}
	).done( function(node) 
	{				
		// Gateway Qualität
		if( node.VPNActive == true ) { var gatewayQuality = Math.round( ( parseInt( node.GatewayQuality ) * 100 ) / 255 ); }
		else if( node.GatewayQuality == '0' ) { var gatewayQuality = 0; }
		else { var gatewayQuality = Math.round( ( ( parseInt( node.GatewayQuality ) + 15 ) * 100 ) / 255 ); }
		
		// Konnektivität
		IPV4Connectivity = '<i class="fa fa-question-circle"></i>';
		if(node.IPV4Connectivity == '0') { IPV4Connectivity = '<i class="fa fa-times-circle"></i>'; }
		if(node.IPV4Connectivity == '1') { IPV4Connectivity = '<i class="fa fa-check-circle"></i>'; }
		
		IPV6Connectivity = '<i class="fa fa-question-circle"></i>';
		if(node.IPV6Connectivity == '0') { IPV6Connectivity = '<i class="fa fa-times-circle"></i>'; }
		if(node.IPV6Connectivity == '1') { IPV6Connectivity = '<i class="fa fa-check-circle"></i>'; }
		
		// Freigeschaltet
		activated = 'Keine Daten verfügbar';
		if(node.Activated == false ) 	{ activated = 'Aktvierung ausstehend'; }
		if(node.Activated == true ) 	{ activated = 'Aktiviert'; }
		
		$('#target-content').html(
				'<h3>Grundinformationen</h3>'
			+	'<div class="info-label">Knotenname</div><div class="info-content">'+ node.Name +'</div>'
			+	'<div class="info-label">Knoten ID</div><div class="info-content" id="node-id">'+ node.ID +'</div>'
			+	'<div class="info-label">Communtiy</div><div class="info-content"><a href="http://nodestatus.vfn-nrw.de/?details-'+ node.CommunityID +'" target="_blank">'+ node.Community +' ('+ node.CommunityID +')</a></div>'
			+	'<div class="info-label">Hardware ID</div><div class="info-content">'+ node.HWID +'&nbsp;&nbsp;&nbsp;<a href="https://freifunk.liztv.net/adm/?hwid=' + node.HWID + '" target="_blank"><i class="fa fa-user-secret"></i></a></div>'
			+	'<div class="info-label">Firmware Version</div><div class="info-content">'+ node.Build +'</div>'
			+	'<div class="info-label">Freischaltungsstatus</div><div class="info-content">'+ activated +'</div>'
			
			+	'<h3>Verbindung</h3>'
			+	'<div class="info-label">IPv6 Adresse</div><div class="info-content">'+ node.IPV6 +'</div>'
			+	'<div class="info-label">Erster Gatewaykontakt</div><div class="info-content">'+ node.FirstSeen +'</div>'
			+	'<div class="info-label">Letzter Gatewaykontakt</div><div class="info-content">'+ node.LastSeen +'<br>'+ node.LastSeenDifference +'</div>'
			+	'<div class="info-label">Verbindungsqualität</div><div class="info-content">'+ gatewayQuality +' %</div>'
			+	'<div class="info-label">Cients verbunden</div><div class="info-content">'+ node.ClientsCount +'</div>'
			+	'<div class="info-label">Uplink</div><div class="info-content">IPv4 &nbsp;&nbsp;'+ IPV4Connectivity +' &nbsp;&nbsp;&nbsp;&nbsp; IPv6 &nbsp;&nbsp;'+ IPV6Connectivity +'</div>'
			
			+	'<h3>Meshlinks (Verbindungen zu anderen Knoten)</h3>'
			+	'<table id="target-meshlinks" class="table table-condensed"></table>'
			
			+	'<h3>Statistiken</h3>'
			+	'<div class="info-label">Clients heute</div><div class="info-content"><img class="img-responsive" src="http://freifunk.liztv.net/clients/'+ node.HWID +'-day.png" /></center></div>'
			+	'<div class="info-label">Clients diese Woche</div><div class="info-content"><img class="img-responsive" src="http://freifunk.liztv.net/clients/'+ node.HWID +'-week.png" /></center></div>'
			+	'<div class="info-label">Clients diesen Monat</div><div class="info-content"><img class="img-responsive" src="http://freifunk.liztv.net/clients/'+ node.HWID +'-month.png" /></center></div>'
			+	'<div class="info-content"><br><a href="http://freifunk.liztv.net/nodes/'+ node.HWID +'" target="_blank">Nodepage ("Altes" Statisiksystem)</a></div>'
			
			+	'<h3>Zusatzinformationen</h3>'
		);

		$.ajax(
		{
			type: 'GET',
			url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/' + node_id + '/additionalInformation',
			dataType: 'json'	
		}
		).done( function(advanced) 
		{
			if (advanced != false) {
				$('#target-content').append(
						'<div class="info-label">Inhaber</div><div class="info-content">'+ advanced.Owner +'</div>'
					+	'<div class="info-label">Straße</div><div class="info-content">'+ advanced.Street +'</div>'
					+	'<div class="info-label">PLZ / Ort</div><div class="info-content">'+ advanced.Zip + ' / ' + advanced.City +'</div>'
					+	'<div class="info-label">Telefon</div><div class="info-content"><a href="tel:'+ advanced.Phone +'">' + advanced.Phone + '</a></div>'
					+	'<div class="info-label">Email</div><div class="info-content"><a href="mailto:' + advanced.Email + '">' + advanced.Email + '</a></div>'
					+	'<div class="info-label">Website</div><div class="info-content"><a href="' + advanced.Website + '" target="_blank">' + advanced.Website + '</a></div>'
					+	'<div class="info-label">Beschreibung</div><div class="info-content">'+ advanced.Description +'</div>'
					+	'<div class="info-label">Wichtiger Hinweis</div><div class="info-content">'+ advanced.Disclaimer +'</div>'
					+	'<div class="info-label">Ursprungsdatei</div><div class="info-content">'+ advanced.Origin +'</div>'
				);
			} else {
				$('#target-content').append(
					'<div class="info-content">Leider hat der Knotenbetreiber keine weiteren Informationen hinterlegt</div>'
				);
			}
		}
		).fail( function()
		{
			$('#target-content').append(
				'<div class="info-content">Leider hat der Knotenbetreiber keine weiteren Informationen hinterlegt</div>'
			);
		});
		
		// Meshlinks
		$.ajax(
		{
			type: 'GET',
			url: 'http://nodeapi.vfn-nrw.de/index.php/get/node/'+ node.ID +'/meshlinks',
			dataType: 'json'
		}
		).done( function(data) 
		{
			meshlinks = 
					'<tr>'
				+		'<th>ID</th>'
				+		'<th>Name</th>'
				+		'<th>Qualität</th>'
				+		'<th>RAW</th>'
				+		'<th>Länge</th>'
				+	'</tr>';
				
			$.each(data, function(i, meshlink)
			{
				if		(parseFloat(meshlink.LinkQuality) < 1.9) 	{ var linkQualityFactor = ((( parseFloat(meshlink.LinkQuality) * 100 ) - 100 ) / 2 ); } 
				else if	(parseFloat(meshlink.LinkQuality) < 2.9) 	{ var linkQualityFactor = ((( parseFloat(meshlink.LinkQuality) * 100 ) - 200 ) / 4 ) + 50; }
				else if	(parseFloat(meshlink.LinkQuality) < 3.9) 	{ var linkQualityFactor = ((( parseFloat(meshlink.LinkQuality) * 100 ) - 300 ) / 8 ) + 75; }
				else if	(parseFloat(meshlink.LinkQuality) < 4.9) 	{ var linkQualityFactor = ((( parseFloat(meshlink.LinkQuality) * 100 ) - 400 ) / 16 ) + 87.5; }
				else 												{ var linkQualityFactor = 100; }
				
				var linkQuality = 100 - Math.round(linkQualityFactor);
				
				meshlinks += 
						'<tr>'
					+		'<td>'+ meshlink.NodeID +'</td>'
					+		'<td class="trigger trigger-meshnode" rel="'+ meshlink.NodeID +'">'+ meshlink.NodeName +'</td>'
					+		'<td>'+ linkQuality +' %</td>'
					+		'<td>'+ meshlink.LinkQuality +'</td>'
					+		'<td>'+ meshlink.LinkLengthInMeters +' m</td>'
					+	'<tr>'
			});
			
			$('#target-meshlinks').html(meshlinks);
			
			$('.trigger-meshnode').click( function()
			{
				$('#target-content').html('');
				var node_id = parseInt($(this).attr('rel'));
				node_details(node_id);
			});
		});
								
		open_nodes(parseInt(node.ID));
	}
	).fail( function () 
	{ 
		//
	});
}