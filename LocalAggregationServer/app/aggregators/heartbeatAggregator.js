/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var HeartbeatEventModel = mongoose.model("HeartbeatEvent");

function HeartbeatAggregator() {
    console.log("Heartbeat aggregator initialized.")
}

HeartbeatAggregator.prototype.process = function (dataKey, dataValue, date, ip) {
    return new Promise(function (resolve) {
        if (dataKey != "heartbeat") {
            resolve();
            return;
        }

        try {
            if (!dataValue || !dataValue.clientId || !dataValue.sourceType) {
                resolve();
                return;
            }

            HeartbeatEventModel.update({clientId: dataValue.clientId}, {
                    date: Date.parse(date),
                    ip: ip,
                    sourceType: dataValue.sourceType,
                    clientName: decodeURIComponent(dataValue.clientName),
                    authUri: dataValue.authUri,
                    kioskName: decodeURIComponent(dataValue.kioskName),
                    kioskId: dataValue.kioskId,
                    host: dataValue.host,
                    flagsContent: dataValue.flagsContent
                }, {upsert: true}, function (saveError) {
                    if (!saveError) {
                        console.log("Heartbeat received: " + dataValue.clientId + " " + dataValue.sourceType + " " + date);
                        resolve();
                    }
                    else {
                        console.log("Heartbeat failed: " + dataValue.clientId);
                        console.log(saveError);
                        resolve();
                    }
                }
            );
        } catch (error) {
            console.log("Could not save heartbeat event.");
            console.log(error);
            resolve();
        }
    });
};

module.exports = HeartbeatAggregator;
