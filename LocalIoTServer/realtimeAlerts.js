/**
 * Created by ashemyakin on 1/8/2016.
 */
var mongoose = require("mongoose");
var AtmSensorDataModel = mongoose.model("AtmSensorData");
var AtmAggregatedDataModel = mongoose.model("AtmAggregatedData");
var AtmDetailsModel = mongoose.model("AtmDetails");
var moment = require('moment');

var sensorHistorySeconds = 5;

var getUltrasonicRawData = function(response){
    return new Promise(function (resolve, reject) {
        var endDate = new Date(moment());
        var startDate = new Date(moment().subtract(sensorHistorySeconds, 's'));

        var aggregateRequest = [
            {
                $match: {
                    "date": {$gte: startDate, $lt: endDate},
                    "atmId": response.atmId,
                    "sensorType": "ultrasonicSensor"
                }
            },
            {
                "$group": {
                    "_id": "$sensorId",
                    "value": { "$push": "$rawData"
                    }
                }
            }
        ];

        AtmSensorDataModel.aggregate(aggregateRequest, function(err, ultrasonicData){
            if(!err){
                response.ultrasonicRawData = [];
                for(var i = 0; i< ultrasonicData.length; i++){
                    var sensorData = {
                        sensorId: ultrasonicData[i]._id,
                        value: [].concat.apply([], ultrasonicData[i].value)
                    };
                    response.ultrasonicRawData.push(sensorData);
                }

                resolve(response);
            } else{
                reject(err);
            }
        });
    });
};

var getVibrationRawData = function(response){
    return new Promise(function (resolve, reject) {
        var endDate = new Date(moment());
        var startDate = new Date(moment().subtract(sensorHistorySeconds, 's'));

        var aggregateRequest = [
            {
                $match: {
                    "date": {$gte: startDate, $lt: endDate},
                    "atmId": response.atmId,
                    "sensorType": "vibrationSensor"
                }
            },
            {
                "$group": {
                    "_id": "$sensorId",
                    "value": { "$push": "$rawData"
                    }
                }
            }
        ];

        AtmSensorDataModel.aggregate(aggregateRequest, function(err, vibrationData){
            if(!err) {
                response.vibrationRawData = [];
                for(var i = 0; i< vibrationData.length; i++){
                    var sensorData = {
                        sensorId: vibrationData[i]._id,
                        value: [].concat.apply([], vibrationData[i].value)
                    };
                    response.vibrationRawData.push(sensorData);
                }

                resolve(response);
            } else {
                reject(err);
            }
        });
    });
};

var getInfraredRawData = function(response){
    return new Promise(function (resolve, reject) {
        var endDate = new Date(moment());
        var startDate = new Date(moment().subtract(sensorHistorySeconds, 's'));

        var aggregateRequest = [
            {
                $match: {
                    "date": {$gte: startDate, $lt: endDate},
                    "atmId": response.atmId,
                    "sensorType": "infraredSensor"
                }
            },
            {
                "$group": {
                    "_id": "$sensorId",
                    "value": { "$push": "$rawData"
                    }
                }
            }
        ];

        AtmSensorDataModel.aggregate(aggregateRequest, function(err, infraredData){
            if(!err) {
                response.infraredRawData = [];
                for(var i = 0; i< infraredData.length; i++){
                    var sensorData = {
                        sensorId: infraredData[i]._id,
                        value: [].concat.apply([], infraredData[i].value)
                    };
                    response.infraredRawData.push(sensorData);
                }

                resolve(response);
            } else {
                reject(err);
            }
        });
    });
};

var getAggregationData = function(response){
    return new Promise(function (resolve, reject) {
        var endDate = new Date(moment());
        var startDate = new Date(moment().subtract(sensorHistorySeconds, 's'));

        var filter = {
            "atmId": response.atmId,
            "date": {$gte: startDate, $lt: endDate}
        };

        AtmAggregatedDataModel.find(filter, function(err, aggregatedData) {
            if (!err) {
                response.peopleCount = 0;
                response.shakesCount = 0;
                response.warning = 0;
                response.critical = 0;

                console.log("aggregation results: " + aggregatedData.length);
                for(var i = 0; i< aggregatedData.length; i++){
                    console.log("people count " + aggregatedData[i].peopleCount);

                    if(aggregatedData[i].peopleCount != "0") {
                        response.peopleCount = aggregatedData[i].peopleCount;
                    }

                    response.shakesCount += aggregatedData[i].shakesCount;
                    response.warning += aggregatedData[i].warning;
                    response.critical += aggregatedData[i].critical;
                }

                resolve(response);
            } else{
                reject(err);
            }
        });
    });
};

var getAtmDetails = function(startDate, endDate){
    return new Promise(function (resolve, reject) {
        AtmDetailsModel.find().sort({atmId: 1 }).exec(function (err, details) {
            var result = [];
            var counter = details.length;
            for(var i = 0; i < details.length; i++) {
                if (moment(details[i].lastUpdate) > moment().subtract(24, 'hours')) {

                    var response = {
                        atmId: details[i].atmId,
                        atmName: details[i].atmName,
                        streamUri: details[i].streamUri,
                        location: details[i].location,
                        lastUpdate: moment().format('MMMM Do YYYY, h:mm:ss a'),
                        startDate: startDate,
                        endDate: endDate
                    };

                    getUltrasonicRawData(response)
                        .then(getAggregationData)
                        .then(getInfraredRawData)
                        .then(getVibrationRawData)
                        .then(function (resp) {
                            result.push(resp);
                            counter--;

                            if (counter == 0) {
                                resolve(result);
                            }
                        }).catch(function (err) {
                            reject(err);
                        });
                } else {
                    counter--;
                    if (counter == 0) {
                        resolve(result);
                    }
                }
            }
        });
    });
};

var saveAlerts = function(results, connection) {
    if(!connection.atms) {
        connection.atms = [];
    }

    for(var i = 0; i< results.length; i++) {
        if(!connection.atms[results[i].atmId]) {
            connection.atms[results[i].atmId] = {
                warning: 0,
                critical: 0
            }
        }

        connection.atms[results[i].atmId].warning += results[i].warning;
        connection.atms[results[i].atmId].critical += results[i].critical;

        results[i].warning = connection.atms[results[i].atmId].warning;
        results[i].critical = connection.atms[results[i].atmId].critical;
    }
};

var getAtmAlerts = function (connection, callback) {
    var category = 'atms_alerts';
    var startDate = connection.atmAlertsUpdate || new Date();
    var endDate = new Date();
    connection.atmAlertsUpdate = endDate;

    getAtmDetails(startDate, endDate)
        .then(function(response) {
            saveAlerts(response, connection);
            connection.data[category] = response;

            callback(null, response);
        })
        .catch(function(err){
            callback(err);
        });
};

module.exports = {
    getAtmAlerts: getAtmAlerts
};
