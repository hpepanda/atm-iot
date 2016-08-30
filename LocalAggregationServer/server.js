"use strict";

require("./app/models/analyticsEvent");
require("./app/models/heartbeatEvent");
require("./app/models/flaggingEvent");
require("./app/models/user");
require("./app/models/rawClickEvent");
require("./app/models/cartEvent");

require("./app/models/atmAggregatedData");
require("./app/models/atmDetails");
require("./app/models/atmSensorData");

var mongoose = require("mongoose");

var use = require('use-import').load();
var config = use("config");

// Connect to mongodb
var connect = function () {
    var options = {server: {socketOptions: {keepAlive: 1}}};
    mongoose.connect(config.mongodbUri, options, function (err) {
        if (!err) {
            var AggregationJob = use("aggregationJob");
            var RabbitMq = use("rabbitMq");
            var aggregationJob = new AggregationJob();
            new RabbitMq(config, aggregationJob);
        } else{
            console.log("Could not connect to the database.")
        }
    });
};


console.log("server configuration: " + JSON.stringify(config));

mongoose.connection.on("error", console.log);
mongoose.connection.on("disconnected", connect);
connect();
if(process.env.PORT) {
    var http = require('http');
    var server = http.createServer();
    server.listen(process.env.PORT);
}
