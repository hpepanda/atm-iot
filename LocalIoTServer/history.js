var moment = require('moment');
var mongoose = require("mongoose");
var AtmAggregatedDataModel = mongoose.model("AtmAggregatedData");
var AtmSensorDataModel = mongoose.model("AtmSensorData");
var AtmDetailsModel = mongoose.model("AtmDetails");


var applyHistoryResults = function(searchResult, result, startDate, endDate) {
    var criticalAlerts = {
        start: startDate,
        end: endDate,
        count: 0
    };

    if(searchResult.length > 0){
        criticalAlerts.count = searchResult[0].critical;
    }

    var warningAlerts = {
        start: startDate,
        end: endDate,
        count: 0
    };

    if(searchResult.length > 0){
        warningAlerts.count = searchResult[0].warning;
    }

    result.criticalAlerts[0].intervals.push(criticalAlerts);
    result.warningAlerts[0].intervals.push(warningAlerts);
    return result;
};

var aggregateFunc = function(result, startDate, endDate) {

    var filter = [{
        $match: {
            atmId: result.atmId || {$ne : null},
            date: {
                "$gte": new Date(startDate),
                "$lt": new Date(endDate)
            }
        }
    },
        {
            $group: {
                _id: null,
                warning: { $sum: "$warning" },
                critical: { $sum: "$critical" }
            }
        }
    ];

    return AtmAggregatedDataModel.aggregate(filter)
        .exec()
        .then(function (searchResult) {
            return applyHistoryResults(searchResult, result, startDate, endDate);
        });
};


function executePromiseSequence(array, callback) {
    return array.reduce(function chain(promise, item) {
        return promise.then(function () {
            return callback(item);
        });
    }, Promise.resolve());
}

var calculateTimeIntervals = function(date) {
    var intervals = [];
    var startDate = moment(date).startOf('day');

    var hourDivider = 3;
    var t = 24 / hourDivider;

    while(t--) {
        var result = {startDate: startDate.format()};
        startDate.add(hourDivider, 'hour');
        result.endDate = startDate.format();
        intervals.push(result);
    }
    return intervals;
};

var getPhotos = function (response) {
    return new Promise(function (resolve, reject) {
        if(response.videos && response.videos.length > 0) {
            var aggregateRequest = [{
                $match: {
                    atmId: response.atmId,
                    date: {
                        "$gte": response.photosStartDate,
                        "$lt": response.photosEndDate
                    },
                    "sensorType": "photoSensor"
                }
            },
                {$sort: {date: -1}},
                {
                    "$group": {
                        "_id": "$sensorId",
                        "value": {
                            "$push": "$rawData"
                        }
                    }
                }
            ];

            AtmSensorDataModel.aggregate(aggregateRequest, function (err, photosData) {
                if (!err) {
                    response.photos = [];
                    if (photosData.length > 0) {
                        response.photos = [].concat.apply([], photosData[0].value)
                    }

                    resolve(response);
                } else {
                    reject(err);
                }
            });
        } else {
            response.photos = [];
            resolve(response);
        }
    });
};

var getTotal = function (response) {
    return new Promise(function (resolve, reject) {
        var aggregateRequest = [{
            $match: {
                atmId: response.atmId,
                date: {
                    "$gte": response.startDate,
                    "$lt": response.endDate
                }
            }
        },
            {
                "$group": {
                    "_id": "$sensorType",
                    "count": { $sum: 1 }
                }
            }
        ];

        AtmSensorDataModel.aggregate(aggregateRequest, function(err, totalData){
            if(!err) {
               for(var i =0; i< totalData.length; i++) {
                   switch (totalData[i]._id){
                       case "infraredSensor": {
                           response.total.infrared = totalData[i].count;
                           break;
                       }
                       case "ultrasonicSensor": {
                           response.total.ultrasonic = totalData[i].count;
                           break;
                       }
                       case "vibrationSensor": {
                           response.total.vibration = totalData[i].count;
                           break;
                       }
                       case "photoSensor": {
                           response.total.photo = totalData[i].count;
                           break;
                       }
                   }
               }

               resolve(response);
            } else {
                reject(err);
            }
        });

    });
};

var getAlerts = function (response) {
    return new Promise(function (resolve, reject) {
        var aggregateRequest = [{
            $match: {
                atmId: response.atmId,
                date: {
                    "$gte": response.startDate,
                    "$lt": response.endDate
                }
            }
        },
            {
                "$group": {
                    "_id": null,
                    "warnings": { $sum: "$warning" },
                    "critical": { $sum: "$critical" }
                }
            }
        ];

        AtmAggregatedDataModel.aggregate(aggregateRequest, function(err, alertsData){
            if(!err) {
                if(alertsData.length > 0) {
                    response.critical = alertsData[0].critical;
                    response.warnings = alertsData[0].warnings;
                }

                resolve(response);
            } else {
                reject(err);
            }
        });

    });
};

var getVideos = function (response) {
    return new Promise(function (resolve, reject) {
        var resdate = new Date(moment.utc(response.date).startOf('day').format());

        response.endDate =  new Date(moment(resdate).add(1, 'days').format()); //new Date(date);//new Date(moment(date).add(1, 'd').format());
        response.startDate = resdate;

        var aggregateRequest = [{
            $match: {
                atmId: response.atmId,
                 date: {
                    "$gte": response.startDate,
                    "$lt": response.endDate
                },
                "sensorType": "videoSensor"
            }
        },
            { $sort : { date : -1} }
        ];

        AtmSensorDataModel.aggregate(aggregateRequest, function(err,videosData){
            if(!err) {
                response.videos  = [];
                response.max = videosData.length;

                var position = videosData.length -1;
                if(response.skip >= 0 && response.skip < position) {
                    position = response.skip;
                }

                response.skip = position;

                if(videosData.length > 0 && videosData[position].rawData[0].streamUri) {
                    response.videos = [videosData[position].rawData[0].streamUri];
                    response.photosEndDate = new Date(videosData[position].rawData[0].finishCapturing);
                    response.photosStartDate = new Date(videosData[position].rawData[0].startCapturing);
                }

                resolve(response);
            } else {
                reject(err);
            }
        });

    });
};

var getAvailableAtms = function (response) {
    return new Promise(function (resolve) {
        AtmDetailsModel.find({}).sort({atmId: 1}).exec(function (err, details) {
            if (!err) {
                if (details.length > 0) {
                    response.atmList = details;
                    if(!response.atmId) {
                        response.atmId = details[0].atmId;
                        response.atmName = details[0].atmName;
                    }

                    resolve(response);
                } else {
                    throw new Error("atms not found");
                }
            } else {
                throw err;
            }
        });
    });
};

var getAtmHistoryDetails = function (date, skip, atmId) {
    var response = {
        timePeriod: 24,
        critical: 0,
        warnings: 0,
        total: {
            ultrasonic: 0,
            vibration: 0,
            photo: 0,
            infrared: 0
        },
        atmId: atmId,
        date: date,
        skip: skip,
        max: 0,
        criticalAlerts: [
            {
                "colorIndex": "error",
                "intervals": []
            }
        ],
        warningAlerts: [
            {
                "colorIndex": "warning",
                "intervals": []
            }
        ]
    };
    console.log("----");
    console.log("history started: " + new Date());
    console.log("----");
    return new Promise(function (resolve, reject) {
        getAvailableAtms(response)
            .then(function(resp) {
                var intervals = calculateTimeIntervals(resp.date);
                return executePromiseSequence(intervals, function(interval) {
                    return aggregateFunc(resp, interval.startDate, interval.endDate);
                });
            })
            .then(getVideos)
            .then(getTotal)
            .then(getAlerts)
            .then(getPhotos)
            .then(function (resp){
                console.log("----");
                console.log("history completed: " + new Date());
                console.log("----");
                resolve(resp);
            }).catch(function(err){
                console.log(err);
                reject(err);
            });
    });
};

var getHistory = function (connection, events, callback) {
    var category = 'atms_history_details';
    var date = events[0].date || new Date();
    var skip = events[0].skip || 0;
    var atmId = events[0].atmId || null;
    getAtmHistoryDetails(date, skip, atmId)
        .then(function (response) {
            connection.data[category] = response;
            //connection.atmAlertsUpdate = date;
            callback(null, response);
        })
        .catch(function (err) {
            callback(err);
        });
};

var calculateRealtimeIntervals = function(timeframe) {
    var intervals = [];
    var startDate = moment().subtract(timeframe, 'hours');

    var hourDivider = 12;
    var t = timeframe / hourDivider;

    for(var i = 0; i < 12; i++){
        var result = {startDate: startDate.format()};
        startDate.add(t, 'hour');
        result.endDate = startDate.format();
        intervals.push(result);
    }

    return intervals;
};

var getCriticalAlerts = function (connection, callback) {
    var category = 'critical_alerts';

    var resp = {
        criticalAlerts: [
            {
                "colorIndex": "error",
                "intervals": []
            }
        ],
        warningAlerts: [
            {
                "colorIndex": "warning",
                "intervals": []
            }
        ]
    };

    var intervals = calculateRealtimeIntervals(connection.timeframe);
    executePromiseSequence(intervals, function(interval) {
            return aggregateFunc(resp, interval.startDate, interval.endDate);
        })
        .then(function (response) {
            connection.data[category] = response;
            callback(null, response);
        })
        .catch(function (err) {
            callback(err);
        });
};

module.exports = {
    getHistory: getHistory,
    getCriticalAlerts: getCriticalAlerts
};
