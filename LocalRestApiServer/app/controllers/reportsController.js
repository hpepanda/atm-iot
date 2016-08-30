/**
 * Created by ashemyakin on 7/1/2015.
 */

function ReportsController() {

}

var mongoose = require("mongoose");
var CartEventModel = mongoose.model("CartEvent");
var ClickEventModel = mongoose.model("RawClickEvent");
var moment = require('moment');

var getTotalClicks = function(report){
    return new Promise(function (resolve, reject) {
        ClickEventModel.count({"clientId": report.clientId}, function(err, count){
           if(!err){
               report.totalClicks = count;
               resolve(report);
           } else{
               reject(err);
           }
        });
    });
};

var getTotalCarts = function(report){
    return new Promise(function (resolve, reject) {
        CartEventModel.count({"status": "cartCreated", "clientId": report.clientId}, function(err, count){
            if(!err){
                report.idleTime = count;
                resolve(report);
            } else{
                reject(err);
            }
        });
    });
};

var getIdleTime = function(report){
    return new Promise(function (resolve, reject) {
        ClickEventModel.find({"clientId": report.clientId}).sort({date: -1}).limit(1).exec(function(err, clicks){
            if(!err){
                if(clicks.length > 0) {
                    report.idleTime = Math.floor(moment.duration(moment(new Date()).diff(clicks[0].date)).asMinutes());
                }

                resolve(report);
            } else{
                reject(err);
            }
        });
    });
};

function GetMaxFriequentItem(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el.assetId] == null) {
            el.count = 1;
            modeMap[el.assetId] = el;
        }
        else
            modeMap[el.assetId].count++;

        if(modeMap[el.assetId].count > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el.assetId].count;
        }
    }

    maxEl.count = maxCount;
    return maxEl;
}

var getTopRequestepItem = function(report){
    return new Promise(function (resolve, reject) {
        CartEventModel.find({clientId: report.clientId}, function(err, carts){
            if(!err){
                var assets = [];
                for(var i=0; i< carts.length; i++){
                    if(carts[i].assets) {
                        assets = assets.concat(carts[i].toObject().assets);
                    }
                }

                var max = GetMaxFriequentItem(assets);
                report.totalItemsRequested = assets.length;
                report.topRequestedItem = max;
                resolve(report);
            } else{
                reject(err);
            }
        });
    });
};

ReportsController.prototype.Get = function (req, res, next) {
    if(!req.query.clientId) {
        next(new Error("clientId is empty"));
        return;
    }
    var report = {
        clientId: req.query.clientId
    };


    getTotalCarts(report)
        .then(getTotalClicks)
        .then(getTopRequestepItem)
        .then(getIdleTime)
        .then(function(result){
        res.send(JSON.stringify(result));
    }).catch(function(err){
        next(new Error(err));
    });
};

module.exports = ReportsController;