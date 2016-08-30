/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var RawClickModel = mongoose.model("RawClickEvent");

function ClickAggregator() {
    console.log("ClickAggregator initialized.")
}

ClickAggregator.prototype.process = function(dataKey, dataValue, date, ip) {
    return new Promise(function (resolve) {
        if (dataKey != "iWallClickEvent" || !dataValue) {
            resolve();
            return;
        }

        var clickEvent = new RawClickModel({
            outerHtml: dataValue.outerHtml,
            clientId: dataValue.clientId,
            ip: ip,
            date: date,
            uri: dataValue.uri,
            clientDate: dataValue.time,
            user: dataValue.user
        });

        clickEvent.save(function (saveError) {
            if (!saveError) {
                console.log("Saved: " + dataKey);
                resolve();
            }
            else {
                console.log("Saving failed: " + dataKey);
                console.log(saveError);
                resolve();
            }
        });
    });
};

module.exports = ClickAggregator;
