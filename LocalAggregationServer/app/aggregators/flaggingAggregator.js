/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var FlaggingEventModel = mongoose.model("FlaggingEvent");

function FlaggingAggregator() {
    console.log("Flagging aggregator initialized.")
}

FlaggingAggregator.prototype.process = function (dataKey, dataValue, date) {
    return new Promise(function (resolve) {
        if (dataKey != "flagging") {
            resolve();
            return;
        }

        try {
            if (!dataValue || !dataValue.badgeId) {
                resolve();
                return;
            }

            if (dataValue.id) {
                var filter = {
                    _id: dataValue.id
                };

                FlaggingEventModel.update(filter, {
                    date: Date.parse(date),
                    badgeId: dataValue.badgeId,
                    kioskId: dataValue.kioskId,
                    cartId: dataValue.cartId,
                    flagType: dataValue.flagType,
                    flag: dataValue.flag
                }, {upsert: true}, function (saveError) {
                    if (!saveError) {
                        console.log("Flagging received: " + dataValue.badgeId + " " + date);
                        resolve();
                    }
                    else {
                        console.log("Flagging failed: " + dataValue.badgeId);
                        console.log(saveError);
                        resolve();
                    }
                });
            } else {
                var flaggingEvent = new FlaggingEventModel({
                    date: Date.parse(date),
                    badgeId: dataValue.badgeId,
                    kioskId: dataValue.kioskId,
                    cartId: dataValue.cartId,
                    flagType: dataValue.flagType,
                    flag: dataValue.flag
                });

                flaggingEvent.save(function (saveError) {
                    if (!saveError) {
                        console.log("Flagging saved: " + dataValue.badgeId);
                        resolve();
                    }
                    else {
                        console.log("Saving failed: " + dataValue.badgeId);
                        console.log(saveError);
                        resolve();
                    }
                });
            }
        } catch (error) {
            console.log("Could not save flagging event.");
            console.log(error);
            resolve();
        }
    });
};

module.exports = FlaggingAggregator;

