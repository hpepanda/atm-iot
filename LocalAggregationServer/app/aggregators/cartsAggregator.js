/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var CartModel = mongoose.model("CartEvent");

function CartsAggregator() {
    console.log("ClickAggregator initialized.")
}

CartsAggregator.prototype.process = function(dataKey, dataValue, date, ip) {
    return new Promise(function (resolve) {
        if ((dataKey != "cartCreated" && dataKey != "cartClosed" && dataKey != "cartCheckout") || !dataValue) {
            resolve();
            return;
        }

        var cartEvent = new CartModel({
            clientId: dataValue.clientId,
            badgeId: dataValue.badgeId,
            status: dataKey,
            assets: dataValue.assets,
            ip: ip,
            date: date
        });

        cartEvent.save(function (saveError) {
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

module.exports = CartsAggregator;
