var domoticzController = {

	configuration : {},

	readConfiguration : function (){
		// just in case configuration load wasn't successful
		if(!mainController.globalConfigData.development.loaded){
			mainController.getConfiguration();
		}
		domoticzController.configuration = mainController.globalConfigData.domoticz;		
	},

	getDomoticzData : function (){
		domoticzController.readConfiguration();

		var configuration = domoticzController.configuration;
		var assembledURL = "http://";

		// use username and password if set
		if(configuration.user)
			assembledURL += configuration.user;
		if(configuration.password)
			assembledURL += ':' + configuration.password + '@';
		
		// make a jsonp call to domoticz
		$.ajax({
			url: assembledURL + configuration.url + ':' + configuration.port + '/json.htm?type=devices&filter=all&used=true&order=Name&jsoncallback=?',
			dataType: 'jsonp',
			jsonpCallback: 'jsoncallback',
			type: 'GET',
			success: function(result) {				
				mainController.log("Loading Domoticz data successful");

				console.log(result);
			}
		});
		
	},
	
};