var request = require("request");
var settings = require("./settings");
var dateFormat = require('dateformat');
var now = new Date();

var dataSender = function(){
	this.send = function(sensorCount,acusticData,countPeople){
		var sensors = [];
		var sensorsData=[];
		for(var  i=0;i<sensorCount;i++)
		{
			sensorsData.push([]);
		}
		for(var i =0;i<sensorCount;i++)
		{
			for(var j=0;j<acusticData.length;j++)
			{
				sensorsData[i].push(acusticData[j][i]);
			}
		}
		for(var i = 0;i<sensorCount-2;i+=2){
			var sensor = {
				sensorType: settings.sensorType1,
				sensorId: "sensor"+(i+1)+"",
				peopleCount: countPeople,
				raw: sensorsData[i]
			}
			sensors.push(sensor);
		}
		
		for(var i = sensorCount-2;i<sensorCount;i++){
			var sensor = {
				sensorType: settings.sensorType2,
				sensorId: "sensor"+(i+1)+"",
				peopleCount: countPeople,
				raw: sensorsData[i]
			}
			sensors.push(sensor);
		}
		
		var sensorData = {
			clientId: settings.clientId,
			clientName: settings.clientId,
			streamUri: settings.streamUri,
			sensors: sensors,
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
				console.log("send success");
			}	
			else {
				console.error(err || ("Server return code " + resp.statusCode));
			}
		});
	}
	var interval =  settings.requestInterval;
	var timer;
	
	this.start = function(){
		timer = setInterval(send,interval);
		console.log("start interval "+interval);
	}
	
	this.stop = function(){
		if(timer)
		{
			clearInterval(timer);
			console.log("stop interval");
		}
	}
}
module.exports = dataSender;