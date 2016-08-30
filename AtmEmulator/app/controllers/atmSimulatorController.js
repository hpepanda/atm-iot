/**
 * Created by ashemyakin on 3/19/2016.
 */

var use = require("use-import");
var Promise = require("bluebird");
var superrequest = require('superagent');
var config = use('config');
var socketIo = null;
var moment = require('moment');

var waitingVideo = config.videoServer +  "/waiting.mpg";
var activeVideo = config.videoServer + "/active.mpg";
var demoVideo =  config.videoServer +"/demo.mpg";


var currentVideo = waitingVideo;

function GameSimulatorController(io) {
    socketIo = io;
}

var broadcastEvent = function(event) {
    console.log(event);
    if(socketIo) {
        socketIo.sockets.emit("log_message", moment().format("YYYY-MM-DD HH:mm:ss") + ": " + JSON.stringify(event));
    }
};

var broadcastClearEvent = function() {
    console.log("clear event");
    if(socketIo) {
        socketIo.sockets.emit("clear", "all");
    }
};

var generateVibrations = function (sensorName, isEnabled) {
    var shakeData = {
        "sensorId":  sensorName,
        "sensorType": "vibrationSensor",
        "shakesCount": "0",
        "raw": [
            "0", "0", "0", "0", "0"
        ]
    };

    if(isEnabled && shakesEnabled) {
        shakeData.shakesCount = shakesCount || 1;
        shakeData.raw = [
            Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50, Math.random() * 50
        ];
    }

    return shakeData;
};

var generateSonic = function (sensorName, isEnabled) {
    var sonicData = {
        "sensorId": sensorName,
        "sensorType": "ultrasonicSensor",
        "peopleCount": "0",
        "raw": [
            "0", "0", "0", "0", "0"
        ]
    };

    if(isEnabled) {
        sonicData.peopleCount = peopleCount || (Math.round(Math.random() * 3, 0) + 1);
        sonicData.raw = [
            Math.random() * 500 + 300, Math.random() * 500 + 300, Math.random() * 500 + 300
        ];
    }

    return sonicData;
};

var generateInfrared = function (sensorName, isEnabled) {
    var infraData = {
        "sensorId": sensorName,
        "sensorType": "infraredSensor",
        "raw": [
            "0", "0", "0"
        ]
    };

    if(isEnabled) {
        infraData.raw = [
            "1", "1", "0"
        ];
    }

    return infraData;
};

var dataGenerationEnabled;
var dataSendingEnabled;
var demoStarted;
var peopleCount;
var shakesCount;
var shakesEnabled;

var sendSendorsData = function(onlySend) {
        var dataToSend = {
            "key": "sensors",
            "value": {
                "clientId": "DemoAtm",
                "clientName": "DemoAtm",
                "streamUri": currentVideo,
                "location": "Demo Room",
                "sensors": [
                    generateSonic("sensor1", dataGenerationEnabled),
                    generateSonic("sensor2", dataGenerationEnabled),
                    generateSonic("sensor3", dataGenerationEnabled),
                    generateInfrared("sensor4", dataGenerationEnabled),
                    generateInfrared("sensor5", dataGenerationEnabled)
                ]
            }
        };


    if(dataSendingEnabled) {
        superrequest.post(config.binaryServerUri)
            .send(dataToSend)
            .set('User-Agent', "atm-emulator")
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (!err) {
                    console.log("sonic data sent");
                    broadcastEvent(dataToSend.value.sensors);
                }
            });
    }

    if(!onlySend) {
        setTimeout(sendSendorsData, 1200);
    }
};

var sendVibrationData = function(onlySend) {
        var dataToSend = {
            "key": "sensors",
            "value": {
                "clientId": "DemoAtm",
                "clientName": "DemoAtm",
                "streamUri": currentVideo,
                "location": "Demo Room",
                "sensors": [
                    generateVibrations("sensor6", dataGenerationEnabled)
                ]
            }
        };

    if(dataSendingEnabled) {
        superrequest.post(config.binaryServerUri)
            .send(dataToSend)
            .set('User-Agent', "atm-emulator")
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (!err) {
                    console.log("vibration data sent");
                    broadcastEvent(dataToSend.value.sensors);
                }
            });
    }
    if(!onlySend) {
        setTimeout(sendVibrationData, 1500);
    }
};

GameSimulatorController.prototype.sendEmptyData = function () {
    dataGenerationEnabled = false;
    dataSendingEnabled = true;
    demoStarted = false;
    peopleCount = null;
    shakesCount = null;
    shakesEnabled = false;
    currentVideo = waitingVideo;
    broadcastClearEvent();
};

GameSimulatorController.prototype.sendSensorsData = function () {
    dataGenerationEnabled = true;
    dataSendingEnabled = true;
    demoStarted = false;
    peopleCount = null;
    shakesCount = null;
    shakesEnabled = true;
    currentVideo = activeVideo;
    broadcastClearEvent();
};


GameSimulatorController.prototype.stopSimulation = function () {
    dataGenerationEnabled = false;
    dataSendingEnabled = false;
    demoStarted = false;
    peopleCount = null;
    shakesCount = null;
    shakesEnabled = false;
    currentVideo = waitingVideo;
    broadcastClearEvent();
};

var startDemoEvents = function(extraSeconds) {
    broadcastEvent({message: "refresh your browser. Demo will be started in " +  extraSeconds / 1000 + " seconds" });
    peopleCount = 0;
    currentVideo = demoVideo;

    setTimeout(function(){
        demoStarted = false;
        peopleCount = null;
        shakesCount = null;
        shakesEnabled = false;
    }, 36 * 1000 + extraSeconds);

    setTimeout(function(){
        peopleCount = 1;
        dataGenerationEnabled = true;
        sendSendorsData(true);
    }, 6 * 1000 + extraSeconds);

    setTimeout(function(){
        peopleCount = null;
        dataGenerationEnabled = false;
        sendSendorsData(true);
    }, 18 * 1000 + extraSeconds);

    setTimeout(function(){
        peopleCount = 2;
        dataGenerationEnabled = true;
        sendSendorsData(true);
    }, 22 * 1000 + extraSeconds);

    setTimeout(function(){
        peopleCount = 2;
        shakesCount = 3;
        shakesEnabled = true;
        dataGenerationEnabled = true;
        sendVibrationData(true);
        sendSendorsData(true);
    }, 24 * 1000 + extraSeconds);

    setTimeout(function(){
        peopleCount = 2;
        shakesCount = 0;
        shakesEnabled = false;
        dataGenerationEnabled = true;
        sendVibrationData(true);
        sendSendorsData(true);
    }, 30 * 1000 + extraSeconds);


    setTimeout(function(){
        peopleCount = null;
        shakesCount = null;
        shakesEnabled = false;
        dataGenerationEnabled = false;
        sendVibrationData(true);
        sendSendorsData(true);
    }, 33 * 1000 + extraSeconds);
};

GameSimulatorController.prototype.startDemo = function () {
    demoStarted = true;
    dataGenerationEnabled = false;
    dataSendingEnabled = true;
    sendSendorsData(true);
    broadcastClearEvent();
    startDemoEvents(5000);
};

sendSendorsData();
sendVibrationData();


module.exports = GameSimulatorController;