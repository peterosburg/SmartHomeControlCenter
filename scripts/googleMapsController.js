var googleMapsController = {

	origins : [],
	destinations : [],
	distances : [],

	loadTimesOfDistances : function () {
		googleMapsController.getOrigins();
		googleMapsController.getDestinations();

		mainController.log('Using google maps API to retrieve distance matrixes');
		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix({
			origins 	: googleMapsController.origins,
			destinations: googleMapsController.destinations,
			travelMode	: google.maps.TravelMode.DRIVING
		}, googleMapsController.distanceMatrixCallback);
	},

	distanceMatrixCallback : function(response, status) {
		mainController.log('Status from google Maps API: ' +status);
		if(status === google.maps.DistanceMatrixStatus.OK) {
			googleMapsController.distances = response;
		}
	},

	getDestinations : function() {
		googleMapsController.destinations.length = 0;
		var destinationObjects = mainController.globalConfigData.distance.destinations;

		for(i=0; i<destinationObjects.length; i++) {
			googleMapsController.destinations.push(destinationObjects[i].address);
		}
	},

	getOrigins : function() {
		googleMapsController.origins.length = 0;
		var originObjects = mainController.globalConfigData.distance.origins;

		for(i=0; i<originObjects.length; i++) {
			googleMapsController.origins.push(originObjects[i].address);
		}
	}
};