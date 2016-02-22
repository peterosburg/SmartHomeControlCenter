var mainController = {
	
	globalConfigData : {},
	configurationLoaded : false,

	// call this once and everthing else should be loaded automatically
	startApplication : function() {
		// provide true if you have a configuration_custom.json created
		mainController.getConfiguration(true);			
	},

	// started right after configuration data has been read successfully
	loadContentData : function() {
		// first load the locales, as a callback, continue loading the weather data
		mainController.loadLocalScript('weatherController.js', mainController.loadWeatherData);	
		// come on show the time, but don't do it before the locales are loaded
		mainController.displayDateAndTime();
		// load the Google Maps API and afterwards add the controller file 
		// it needs to be done in the callback, to ensure that the API initialization - which is asynchronous - was successful
		mainController.loadGoogleMapsAPI(mainController.loadGoogleMapsController);
		// add onclick handlers
		mainController.configureOnClickHandlers();
	},

	loadGoogleMapsAPI : function(successCallback) {
		mainController.log("Loading Google Maps API");
		$.getScript('https://maps.googleapis.com/maps/api/js?key='+ mainController.globalConfigData.distance.googleMapsDistanceAPIKey +'&signed_in=true')
			.done(function(script, textStatus) {
				mainController.log(script);
				mainController.log(textStatus + ' while loading Google Maps API');
				if(successCallback) successCallback();
			})
			.fail(function(jqxhr, settings, exception){
				mainController.log("Error while loading Google Maps API");
			});
	},

	getConfiguration : function(custom) {
		var url = 'json/configuration_custom.json';
		if(!custom)
			url = 'json/configuration.json'

		console.log('Reading ' + url);
		$.ajax({
			dataType: 'json',
			url: url,
			type: 'GET',
			success: function(result) {
				// make sure to save configuration information and afterwards continue loading everything else
				console.log('configuration.json loaded successfully');
				mainController.mapConfiguration(result);
				// load locale information and afterwards start loading the content data
				locale.loadLocalizedText(result.general.language, mainController.loadContentData);
			},
			error: function() {
				if(!custom)
					console.log('Error while loading configuration');
				else
					mainController.getConfiguration(false);
			}
		});
	},

	loadWeatherData : function() {
		weatherController.getWeather();
	},

	loadGoogleMapsController : function() {
		// dynamically load the controller class
		mainController.loadLocalScript('googleMapsController.js');
		//, mainController.loadTimesOfDistances
	},

	/*loadTimesOfDistances : function() {
		googleMapsController.loadTimesOfDistances();
	},*/

	displayDateAndTime : function() {		
		var date = Date.now();
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
		var dateString = new Intl.DateTimeFormat(mainController.globalConfigData.general.language, options);
		options = {hour: 'numeric', minute: 'numeric'};
		var timeString = new Intl.DateTimeFormat(mainController.globalConfigData.general.language, options);
		$('#dateAndTime').html(dateString.format(date) + '<br/>' + timeString.format(date) + ' ' + locale.texts.oclock);
		setTimeout(mainController.displayDateAndTime, 10000);
	},

	mapConfiguration : function(data) {		
		mainController.globalConfigData = data;
		console.log('globalConfigData written');
		if(!data.development.consoleLogging)
			console.log('Logging is disabled by configuration. You will see no more logs here');

		$('#applicationTitle').html(data.general.title);
		$('#versionInfo').html('Version '+data.general.version+' - Copryright 2016: ' + data.general.author);
	},

	log : function(msg) {
		if(mainController.globalConfigData.development.consoleLogging)
			console.log(msg);
	},

	loadLocalScript : function(scriptName, successCallback) {
		mainController.log('Loading Script ' + scriptName);
		$.getScript('scripts/' + scriptName)
		.done(function(script, textStatus){
			mainController.log('Successfully loaded local script ' + scriptName);
			if(successCallback) successCallback();
		})
		.fail(function(jqxhr, settings, exception) {
			mainController.log('Failed to load local script ' + scriptName);
			mainController.log(exception);
		})
	},

	configureOnClickHandlers : function() {
		// information button shall trigger reading the time values for origin to destination travels
		$('#nav_information').click(function(){
			googleMapsController.loadTimesOfDistances();
		});
	}

}