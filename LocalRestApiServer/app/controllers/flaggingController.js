/**
 * Created by ashemyakin on 7/1/2015.
 */

function FlaggingController() {

}

var mongoose = require("mongoose");
var FlaggingEventModel = mongoose.model("FlaggingEvent");

FlaggingController.prototype.Get = function (req, res, next) {
    if(!req.query.badgeId) {
        next(new Error("badgeId is empty"));
        return;
    }

    var filter = {
        badgeId: req.query.badgeId
    };

    if(req.query.cartId){
        filter.cartId = req.query.cartId
    }

    if(req.query.kioskId){
        filter.kioskId = req.query.kioskId
    }

    FlaggingEventModel.find(filter).exec(function (err, heartbeats) {
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

module.exports = FlaggingController;