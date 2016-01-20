/**
 * Created by kuyav on 1/19/2016.
 */

var request = require('request');
var use = require('use-import');
var config = use('app-config');

exports.notify = function(videoClip){
    console.log(videoClip);

    var reqOptions = {
        method: 'POST',
        url: config.dataCollectionUri,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key: "sensors",
            value: {
                clientId: config.atmClientId,
                clientName: config.atmClientId,
                streamUri: videoClip.uri,
                sensors: [{
                    sensorType: "videoSensor",
                    sensorId: "videoStreamSensor",
                    raw:
                        [{streamUri: videoClip.uri,
                        startCapturing: videoClip.start,
                        finishCapturing: videoClip.finish}]

                }],
                date: new Date()
            }
        })
    };

    request(reqOptions, function (error, response) {
        if (!error && response.statusCode == 201) {
            console.log("Data collection notified");
        } else {
            if(error){
                console.log(error);
            }else{
                console.log(response);
            }
        }
    });
};