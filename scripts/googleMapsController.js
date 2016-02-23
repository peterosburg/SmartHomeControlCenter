var googleMapsController = {

	routes : [],

	// used to track which object is been calculated by the API as there is no direct refence in the APIs response yet
	routesIndex : 0,

	loadTimesOfRoutes : function () {		
		googleMapsController.getRoutes();

		// make sure to get rid of the already displayed routes


		// reset the counter and start with the first entry
		// all other entries will be processed in the callback method incrementally
		googleMapsController.routesIndex = 0;
		googleMapsController.loadTimeOfSingleRoute(googleMapsController.routes[0]);		
	},

	distanceMatrixCallback : function(response, status) {		
		var index = googleMapsController.routesIndex;
		mainController.log('Status from google Maps API: ' +status);
		console.log(response);

		if(status === google.maps.DistanceMatrixStatus.OK) {
			// at this point you needed to make sure that you only provide one origin address and one destination address per route only!
			// this mapping only considers the first entries and disregards all others (if provided)
			mainController.log("Successfully retrieved distance time for route " + googleMapsController.routes[index].name);
			googleMapsController.routes[index].distance = response.rows[0].elements[0].distance.text;
			googleMapsController.routes[index].time = response.rows[0].elements[0].duration.text;
			googleMapsController.showRouteCollapsed(googleMapsController.routes[index]);
		}

		// count the index up and check if you have more entries to process
		googleMapsController.routesIndex++;
		if(googleMapsController.routesIndex < googleMapsController.routes.length)
			googleMapsController.loadTimeOfSingleRoute(googleMapsController.routes[googleMapsController.routesIndex]);
	},

	getRoutes : function () {
		googleMapsController.routes = mainController.globalConfigData.distance.routes;
	},

	loadTimeOfSingleRoute : function(route) {
		var units = google.maps.UnitSystem.METRIC;
		if(mainController.globalConfigData.distance.distanceUnits === "imperial") {
			units = google.maps.UnitSystem.IMPERIAL;
		}
		mainController.log('Using google maps API to retrieve distance of '+ route.name);

		// drivingOptions added to the call, but they are only considered if the API key reflects an API Premium Plan unfortunately
		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix({
			origins 	: route.origin,
			destinations: route.destination,
			travelMode	: google.maps.TravelMode.DRIVING,
			unitSystem 	: units,
			drivingOptions: {
				departureTime: new Date(),
				trafficModel: google.maps.TrafficModel.BEST_GUESS
			}
		}, googleMapsController.distanceMatrixCallback);	
	},

	showRouteCollapsed : function(route) {
		// make sure to have an id without whitespaces
		var id = 'route_' + (route.name.replace(/ /g, ''));
		var div = $('#'+id);
		
		// don't create a new div if it was already added, just empty it ... otherwise go and create
		if(div.length < 1) {
			div = $('<div />', {
				id : id,
				class : 'route_information'
			});
			div.appendTo(information_content);			
		}
		else {
			div.empty();
		}
		
		// always recreate that content
		var head = $('<div />', {
			class : 'route_headline'
		}).html(route.name);
		head.appendTo(div);

		var distance = $('<div />', {
			class : 'route_distance' 
		}).html(route.distance);
		distance.appendTo(div);

		var time = $('<div />', {
			class : 'route_time'
		}).html(route.time);
		time.appendTo(div);
	}
};