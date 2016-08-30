/**
 * Created by ashemyakin on 7/1/2015.
 */
var getIp = require('ipware')().get_ip;

var _rabbitMq = null;
function AnalyticsController(rabbitMq) {
    _rabbitMq = rabbitMq;
}

var mongoose = require("mongoose");
var amqp = require('amqp');
var moment = require('moment');

var use = require('use-import');
var config = use("config");

AnalyticsController.prototype.Create = function (req, res, next) {
    try {
        var ipInfo = getIp(req);
        console.log(ipInfo);
        console.log(JSON.stringify(req.body));

        _rabbitMq.SaveInboundMessage({
            key: req.body.key,
            value: req.body.value,
            ip: ipInfo.clientIp,
            date: new Date(moment())
        }).then(function () {
            res.sendStatus(201);
        }).catch(function (err) {
            next(new Error(err));
        });
    } catch(err){
        next(new Error(err));
    }
};

module.exports = AnalyticsController;
