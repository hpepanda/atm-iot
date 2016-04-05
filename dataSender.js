var request = require("request");
var settings = require("./settings");
var dateFormat = require('dateformat');
var now = new Date();

var dataSender = function(){
	this.send = function(uri){
		var numbers = [];
		for(var i=uri.length-5;i>=0;i--)
		{
			if(uri[i]!='_')
			{
				numbers.push(uri[i]);
			}
		}
		var countPeople = 0;
		for(var i=numbers.length-1;i>=0;i--)
		{
			countPeople*=10;
			countPeople+=parseInt(numbers[i]);
		}
		var sensor = {
				sensorType: settings.sensorType,
				sensorId: "sensor"+(i+1)+"",
				peopleCount: countPeople,
				raw: [uri]
		}
		var sensorData = {
			clientId: settings.clientId,
			clientName: settings.clientId,
			streamUri: settings.streamUri,
			sensors: [sensor],
			location: settings.location,
			date: dateFormat(now, "mm/dd/yyyy h:MM:ss TT"),
			peopleCount: countPeople
		}
		var result = {
			key:settings.key,
			value:sensorData
		}
		var options =
		{
			url: "http://" + settings.serverIP + ":" + settings.serverPort  +"/"+ settings.path,
			form: result,
			headers: {
				"Content-Type": "application/json"
			}
		};
		//console.log(result);

		request.post(options, function(err, resp) {
			if (!err && (resp.statusCode === 201)) {
				console.log("send success uri");
			}	
			else {
				console.error(err || ("Server return code " + resp.statusCode));
			}
		});
	}
}
module.exports = dataSender;