/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var AnalyticsEventModel = mongoose.model("AnalyticsEvent");

function KeyValueAggregator() {
    console.log("KeyValue aggregator initialized.")
}

KeyValueAggregator.prototype.process = function(dataKey, dataValue, date, ip) {
    return new Promise(function (resolve) {
        if(!dataValue)
        {
            console.log("Message too long.");
            resolve();
            return;
        }

        var analyticsEvent = new AnalyticsEventModel({
            key: dataKey,
            value: dataValue,
            date: date,
            ip: ip
        });

        analyticsEvent.save(function (saveError) {
            if (!saveError) {
                console.log("Saved: " + dataKey + ": " + dataValue);
                resolve();
            }
            else {
                console.log("Saving failed: " + dataKey + ": " + dataValue);
                console.log(saveError);
                resolve();
            }
        });
    });
};

module.exports = KeyValueAggregator;
