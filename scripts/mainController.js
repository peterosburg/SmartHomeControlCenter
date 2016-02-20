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
		weatherController.getWeather();
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

	mapConfiguration : function(data) {		
		mainController.globalConfigData = data;
		console.log('globalConfigData written');
		if(!data.development.consoleLogging)
			console.log('Logging is disabled by configuration. You will see no more logs here');

		$('#applicationTitle').html(data.general.title);
		$('#versionInfo').html('Version '+data.version+' - Copryright 2016: ' + data.author);
	},

	log : function(msg) {
		if(mainController.globalConfigData.development.consoleLogging)
			console.log(msg);
	}

}