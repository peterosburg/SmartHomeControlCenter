# SmartHomeControlCenter
A control interface to mainly be used as a control center but can also be used as an intranet landing page

## Intention
SmartHomeControlCenter initial intention is to provide an interface for a wall mounted monitor with touch capibilities. 
Of course the main purpose is to make use of the smart home functions provided by Domoticz (a domoticz server needs to be running 
within your network and needs to provide the API). See more details about Domoticz here: https://www.domoticz.com/

Besides the smart home functionality, the SmartHomeControlCenter shall also provide additional information: 
* the current weather at a specified location
* needed time for driving to certain locations
* calendar entries of Google Calendar

## Used APIs
* Openweathermap.org for weather information and forecasts [*API Key is needed*]
* Google Maps API - Distance Matrix API to retrieve information about driving distances [*API Key is needed*]
* Domoticz API - to retrieve device information & to control devices

## Features
* Using jQuery Mobile (https://jquerymobile.com/) to have a proper touch enabled interface mainly focusing on a 1024 x 768 screen
* Configure the SmartHomeControlCenter by changing the configuration file. For preventing getting your configurations overwritten with each update, copy the file to configuration_custom.json and make your settings.
* Localization support by making use of texts.json (later I will add texts_en.json and therefore at least have an english translation)
