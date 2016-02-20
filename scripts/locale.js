var locale = {
	texts : {},
	textLoaded : false,
	textLoadRetry : false,

	loadLocalizedText : function(localeValue, successCallback) {
		var that = this;

		// fallback solution if unknown locale is provided, use german locale
		var url = 'json/text.json';
		if(localeValue === "de" )
			url = "json/text.json";
		else
			url = "json/text_"+localeValue+"json";

		mainController.log('Loading localized texts for locale "' + localeValue +  '" from url ' + url);
		$.ajax({
			dataType: 'json',
			url: url,
			type: 'GET',
			success: function(result) {
				mainController.log('Loaded localized texts successfully');				
				that.texts = result;
				that.textLoaded = true;
				that.textLoadRetry = false;
				if(successCallback) successCallback();

				// set the labels according the loaded texts
				that.setLocaleTexts();				
			},
			error: function() {
				if(!that.textLoadRetry) {
					mainController.log('Failed to load texts for "' + locale + '"" retrying with "de"')
					that.loadLocalizedText('de');
					that.textLoadRetry = true;
				} else
					mainController.log('Failed to load localized texts');
			}
		})

	},

	setLocaleTexts : function() {
		locale.setLocalizedNavigation();
		locale.setWeatherLabels();
		locale.setSmarthomeLabels();
	},

	setLocalizedNavigation : function() {
		$('#nav_smarthome').html(locale.texts.smarthome);
		$('#nav_calendar').html(locale.texts.calendar);
		$('#nav_information').html(locale.texts.information);
	},
	
	setWeatherLabels : function() {
		$('#today_title').html(locale.texts.today);
		$('#tomorrow_title').html(locale.texts.tomorrow);
		$('#day_after_tomorrow_title').html(locale.texts.day_after_tomorrow);
	},

	setSmarthomeLabels : function() {
		$('#smarthome_title').html(locale.texts.smarthome_title);
	}
}