/**
 * Created by ashemyakin on 7/1/2015.
 */

var moment = require('moment');

function HeartbeatController() {

}

var mongoose = require("mongoose");
var HeartbeatEventModel = mongoose.model("HeartbeatEvent");

HeartbeatController.prototype.Get = function (req, res, next) {
    var filter = {};

    if(req.query.sourceType){
        filter.sourceType = req.query.sourceType
    }

    HeartbeatEventModel.find(filter).exec(function (err, heartbeats) {
        if (!err) {
            var transformedHeartbeats = heartbeats.map(function (heartbeat) {
                return heartbeat.toClient();
            });

            res.end(JSON.stringify(transformedHeartbeats));
        } else {
            next(new Error(err));
        }
    });
};

HeartbeatController.prototype.GetAdnroidConfig = function (req, res, next) {
    var steps = [
        {
            $match: {"sourceType": "iWall"}
        },
        {
            "$group": {
                "_id": {
                    "iWallId": "$iWallId",
                    "kioskId": "$kioskId",
                    "kioskName": "$kioskName"
                },
                "authUri": { $first: '$authUri' },
                "clientName": { $first: '$clientName'},
                "flagsContent": { $first: '$flagsContent'}
            }
        },
        {
            "$group": {
                "_id": "$_id.iWallId",
                "api": { $first: '$authUri'},
                "name": { $first: '$clientName'},
                "flagsContent": { $first: '$flagsContent'},
                "kiosks": {
                    "$push": {
                        "id": "$_id.kioskId",
                        "name": "$_id.kioskName"
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                name: 1,
                api: 1,
                kiosks: 1,
                flagsContent: 1
            }
        }
    ];

    HeartbeatEventModel.aggregate(steps, function (err, results) {
        if (!err) {
            var result = {
                "androidClientConfig": {
                    "version": 1,
                    "iWalls": results
                }
            };

            res.end(JSON.stringify(result));
        } else {
            next(new Error(err));
        }
    });
};

HeartbeatController.prototype.GetServerTime = function(req, res){
    res.end(JSON.stringify({
        serverTime: new Date(moment())
    }));
};

module.exports = HeartbeatController;