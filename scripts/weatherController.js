var weatherController = {

	forecastVisible : false,
	forecastToday : [],
	forecastTomorrow : [],
	forecastDayAfterTomorrow : [],

	loadingWeatherDataRetry : false,
	configuration : {},

	readConfiguration : function (){
		// just in case configuration load wasn't successful
		if(!mainController.globalConfigData.development.loaded){
			mainController.getConfiguration();
		}
		weatherController.configuration = mainController.globalConfigData.weather;		
	},

	getWeather : function() {
		weatherController.readConfiguration();	

		// locally use configuration data for better reading purposes
		var configuration = mainController.globalConfigData;

		// OpenWeatherMap meta information
		var api_key = configuration.weather.openweathermapAPIKey;
		var cityId = configuration.weather.openweathermapCityId;
		var units = configuration.weather.openweathermapUnits;
		var lang = configuration.general.language;		
		var url = 'http://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&APPID=' + api_key + '&units='+ units +'&lang=' + lang;

		// storage for data about weather
		var weather_data;
		
		mainController.log('Retrieve weather information from URL: ' + url);

		$.ajax({
			url: url,
			dataType: 'JSONP',
			jsonpCallback: 'callback',
			type: 'GET',
			success: function(result) {				
				weatherController.loadingWeatherDataRetry = false;
				// add the information to screen
				weatherController.showCurrentWeather(result);								

				// update the weather information every 15 seconds
				setTimeout(weatherController.updateWeatherInfo, weatherController.configuration.currentWeatherRefresh);
			},
			error: function() {
				mainController.log('Error while Loading weather information');
				// if configuration wasn't set correctly, immediately try loading again, but only retry once
				if(!configuration.development.loaded && !weatherController.loadingWeatherDataRetry) {
					mainController.log("Configuration data not read correctly, retry loading weather data in 100ms");
					setTimeout(weatherController.updateWeatherInfo, 100);
					weatherController.loadingWeatherDataRetry = true;
				} 
				// retry after 5 sec only once, we don't want to create an infinite loop
				else if(!weatherController.loadingWeatherDataRetry) {
					mainController.log("Retry to load weather data in 5 seconds");
					setTimeout(weatherController.updateWeatherInfo, 5000);
					weatherController.loadingWeatherDataRetry = true;
				} else {
					mainController.log("Loading weather data failed, no more retries left");
				}
			}
		});
	},

	updateWeatherInfo : function() {	
		weatherController.getWeather();
	},

	/* ----- Current Weather Information ---- */
	showCurrentWeather : function(weather_data) {
		// the data structure is defined by Openweathermap.org
		weatherController.createCurrentCity(weather_data.name);
		weatherController.createCurrentTemperature(weather_data.main.temp);
		weatherController.createHumidity(weather_data.main.humidity);
		weatherController.createCurrentWeatherIcon(weather_data.weather[0].icon, weather_data.weather[0].description);
	},

	createCurrentCity : function(cityName) {
		// check if div is not created already
		if($('#currentCity').length < 1) {
			var div = $('<div />', {
				id: 'currentCity'
			}).html(cityName);
			div.appendTo('#weatherInfo');
		} else {
			$('#currentCity').html(cityName);
		}
	},
	

	createCurrentWeatherIcon : function(iconID, description) {
		// check if img is not created already
		if($('#currentWeatherIcon').length < 1) {
			var img = $('<img />', {
				id: 'currentWeatherIcon',
				src: 'http://openweathermap.org/img/w/' + iconID +'.png',
				alt: description,
				title: description
			});
			img.appendTo($('#weatherInfo'));
		} else {
			$('#currentWeatherIcon').attr('src', 'http://openweathermap.org/img/w/' + iconID +'.png');
		}
		
	},

	createCurrentTemperature : function(temperature) {
		// make sure to show only one decimal digit
		var roundedTemp = temperature.toFixed(1);

		// check if div is not created already
		if($('#currentTemperature').length < 1) {
			var div = $('<div />', {
				id: 'currentTemperature'
			}).html(roundedTemp + ' ' + weatherController.getTemperatureUnit());
			div.appendTo($('#weatherInfo'));
		} else {
			($('currentTemperature')).html(roundedTemp + ' '+ weatherController.getTemperatureUnit());
		}
	},

	createHumidity : function(humidity) {
		// check if div is not created already
		if($('#currentHumidity').length < 1) {
			var div = $('<div />', {
				id: 'currentHumidity',		
			}).html('Luftfeuchtigkeit: ' + humidity + '%');
			div.appendTo($('#weatherInfo'));	
		} else
			($('currentHumidity')).html('Luftfeuchtigkeit: ' + humidity + '%');	
	},

	/* ----- End of Current Weather Information ---- */

	/* ----- Forecast Information ----- */
	toggleForecast : function() {
		if(weatherController.forecastVisible) {			
			this.hideForecastInfo();		
		}
		else {			
			this.showForecastInfo();
			//automatically hide the forecast after given time
			setTimeout(weatherController.hideForecastInfo,10000);
		}
	},

	showForecastInfo : function() {
		if(!weatherController.forecastVisible){
			// make the forecast appear by moving the current info to left and unfolding the forecast to the left
			$('#weatherInfo').animate({right: 740 + "px"}, 200);			
			$('#weatherForecast').animate({width: 'toggle'}, 300, function(){weatherController.forecastVisible = true;});
			weatherController.getWeatherForecast();
		}
	},

	hideForecastInfo : function () {
		if(weatherController.forecastVisible){
			// make the forecast disappear by folding to the right and moving the current info to the right position
			$('#weatherForecast').animate({width: 'toggle'}, 200);
			$('#weatherInfo').animate({right: 1 + "em"}, 300, function(){weatherController.forecastVisible = false;});
		}
	},

	getWeatherForecast : function (){
		var api_key = this.configuration.openweathermapAPIKey;
		var cityId = this.configuration.openweathermapCityId;
		var units = this.configuration.openweathermapUnits;
		var lang = mainController.globalConfigData.general.language;
		var url = 'http://api.openweathermap.org/data/2.5/forecast?id=' + cityId + '&APPID=' + api_key + '&units='+ units +'&lang=' + lang;

		$.ajax({
			url: url,
			dataType: 'JSONP',
			jsonpCallback: 'callback',
			type: 'GET',
			success: function(result) {				
				mainController.log("Loading forecast data successful");

				weatherController.emptyForecastLists();
				result.list.forEach(weatherController.getForecastLists);

				weatherController.showForecasts();		
			},
		});
	},

	emptyForecastLists : function() {
		weatherController.forecastToday.length = 0;
		weatherController.forecastTomorrow.length = 0;
		weatherController.forecastDayAfterTomorrow.length = 0;
	},

	getForecastLists : function(value, index, array) {
		// build the date string of current value for comparison purposes
		var timestamp = value.dt;
		var valueDate = new Date(timestamp*1000);		
		var valueDateString = weatherController.getDateString(valueDate);

		// build respective day strings to compare them against value date string
		var todayString = weatherController.getDateString(new Date());
		var tomorrowString = weatherController.getDateString(new Date(Date.now() + 24*60*60*1000));
		var dayAfterTomorrowString = weatherController.getDateString(new Date(Date.now() + 2*24*60*60*1000));

		if(valueDateString === todayString) weatherController.forecastToday.push(value);
		if(valueDateString === tomorrowString) weatherController.forecastTomorrow.push(value);
		if(valueDateString === dayAfterTomorrowString) weatherController.forecastDayAfterTomorrow.push(value);		
	},

	getDateString : function(date) {

		var year = date.getFullYear();
		var month = '0' + (date.getMonth() + 1);
		var day = '0' + date.getDate();

		return year + '-' + month.substr(-2) + '-' + day.substr(-2);
	},

	showForecasts : function() {
		$('#todayForecastEntries').empty();
		$('#tomorrowForecastEntries').empty();
		$('#dayAfterTomorrowForecastEntries').empty();
		weatherController.forecastToday.forEach(weatherController.showTodayForecastEntries);
		weatherController.forecastTomorrow.forEach(weatherController.showTomorrowForecastEntries);
		weatherController.forecastDayAfterTomorrow.forEach(weatherController.showDayAfterTomorrowForecastEntries);
	},

	showTodayForecastEntries : function(value, index, array) {
		weatherController.showValueInForecastDiv(value, index, 'todayForecastEntries');
		
	},

	showTomorrowForecastEntries : function(value, index, array) {
		weatherController.showValueInForecastDiv(value, index, 'tomorrowForecastEntries')
	},

	showDayAfterTomorrowForecastEntries : function(value, index, array) {
		weatherController.showValueInForecastDiv(value, index, 'dayAfterTomorrowForecastEntries')
	},

	showValueInForecastDiv : function(value, index, divId) {		
		var timeString = value.dt_txt.substr(11,5);

		// only consider the below times for being displayed - openweathermap provides values for every 3 hrs
		if(timeString === '06:00' || timeString === '12:00' || timeString === '18:00' || timeString === '21:00') {
			$('#' + divId).append($('<tr>', {'id' : divId + '_row'+index}));

			$('#' + divId + '_row'+index).append($('<td />', {'class' : 'forecastTime'}).html(weatherController.getTimeDescriptor(timeString)));
			$('#' + divId + '_row'+index).append($('<td />', {'class' : 'forecastTemperature'}).html(value.main.temp.toFixed(1) + ' ' + weatherController.getTemperatureUnit()));

			//weatherController.createCurrentWeatherIcon(weather_data.weather[0].icon, weather_data.weather[0].description);

			$('#' + divId + '_row' + index).append($('<td />').append($('<img />', {
				class: 'forecastWeatherIcon',
				src: 'http://openweathermap.org/img/w/' + value.weather[0].icon +'.png',
				alt: value.weather[0].description,
				title: value.weather[0].description
			})));
		}
	},

	getTemperatureUnit : function() {
		// return the unit based on the configuration setting
		var returnValue = '&deg;'
		if(weatherController.configuration.openweathermapUnits === 'metric') {
			returnValue = returnValue + 'C';
		} else if(weatherController.configuration.openweathermapUnits === 'imperial') {
			returnValue = returnValue + 'F';
		}
		return returnValue;
	},

	getTimeDescriptor : function(time) {
		return time + ' ' + locale.texts.oclock;
	}
};