/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var AtmDetailsModel = mongoose.model("AtmDetails");
var AtmSensorDataModel = mongoose.model("AtmSensorData");
var AtmAggregatedDataModel = mongoose.model("AtmAggregatedData");

function AtmAggregator() {
    console.log("Atm aggregator initialized.")
}

var saveAtmData = function(atmData) {
    return new Promise(function (resolve, reject) {
        if(!atmData.atmId) {
            reject();
        }

        if (atmData.atmName && atmData.streamUri && atmData.location && !atmData.isVibration) {
            AtmDetailsModel.update({atmId: atmData.atmId}, {
                atmName: atmData.atmName,
                streamUri: atmData.streamUri,
                location: atmData.location,
                lastUpdate: atmData.lastUpdate
            }, {upsert: true}, function (saveError) {
                if (!saveError) {
                    console.log("atm updated");
                    resolve();
                }
                else {
                    console.log(saveError);
                    reject(saveError);
                }
            });
        } else {
            console.log("atm update skipped");
            resolve();
        }
    });
};

var saveAggregatedData = function(atmData) {
    return new Promise(function (resolve, reject) {
        atmData.save(function(err){
            if(!err){
                resolve();
            } else{
                reject(err);
            }
        });
    });
};

var saveSensorData = function(atmData) {
    return new Promise(function (resolve, reject) {
        AtmSensorDataModel.collection.insert(atmData, function(err){
            if(!err){
                resolve();
            } else{
                reject(err);
            }
        });
    });
};

AtmAggregator.prototype.process = function (dataKey, dataValue, date, ip) {
    return new Promise(function (resolve) {
        if (dataKey != "sensors") {
            resolve();
            return;
        }

        if(typeof dataValue == "string") {
            dataValue = JSON.parse(dataValue);

            if(dataValue && dataValue.sensors && dataValue.sensors.raw) {
                var temp = dataValue.sensors;
                temp.sensorId = "sensor 10";
                dataValue.sensors = [temp];
            }
        }

        try {
            if (dataValue && dataValue.clientId && dataValue.sensors && dataValue.sensors.length > 0) {
                var atmData = {
                    atmId: dataValue.clientId,
                    atmName: dataValue.clientName,
                    streamUri: dataValue.streamUri,
                    location: dataValue.location,
                    lastUpdate: date
                };

                var aggregatedData = new AtmAggregatedDataModel({
                    atmId: dataValue.clientId,
                    peopleCount: 0,
                    shakesCount: 0,
                    warning: false,
                    critical: false,
                    date: date
                });

                var sensorsData = [];
                for (var i = 0; i < dataValue.sensors.length; i++) {
                    var rawData = dataValue.sensors[i].raw;

                    if (dataValue.sensors[i].peopleCount){
                        aggregatedData.peopleCount = dataValue.sensors[i].peopleCount;
                    }


                    switch (dataValue.sensors[i].sensorType) {
                        case "ultrasonicSensor":

                            if(!rawData || rawData.length == 0) {
                                rawData = [0];
                            }

                            break;
                        case "vibrationSensor":
                            if(dataValue.sensors[i].shakesCount > aggregatedData.shakesCount){
                                aggregatedData.shakesCount = dataValue.sensors[i].shakesCount;
                                aggregatedData.critical = true;
                                atmData.isVibration = true;
                            }

                            if(!rawData || rawData.length == 0) {
                                rawData = [0];
                            }

                            break;
                        case "infraredSensor":
                            if(!rawData || rawData.length == 0) {
                                rawData = ["0"];
                            }

                            break;
                    }

                    sensorsData.push({
                        atmId: dataValue.clientId,
                        sensorId: dataValue.sensors[i].sensorId,
                        sensorType: dataValue.sensors[i].sensorType,
                        rawData: rawData,
                        date: new Date(date)
                    });
                }

             /*   if(dataValue.peopleCount) {
                    aggregatedData.peopleCount = dataValue.peopleCount;
                }*/

                if(aggregatedData.peopleCount >= 2) {
                    aggregatedData.warning = true;
                }

                saveAtmData(atmData)
                    .then(function(){
                        console.log("atm info updated");
                        return saveSensorData(sensorsData); })
                    .then(function(){
                        console.log("atm sensor data saved");
                        return saveAggregatedData(aggregatedData); })
                    .then(function(){
                        console.log("atm aggregated data saved");
                        resolve(); })
                    .catch(function(err){
                        console.log("atm saving failed");
                        console.log(err);
                        resolve();
                });
            } else{
                resolve();
            }
        } catch (error) {
            console.log("Could not save heartbeat event.");
            console.log(error);
            resolve();
        }
    });
};

module.exports = AtmAggregator;
