"use strict";

var express = require("express");
require("./app/models/heartbeatEvent");
require("./app/models/flaggingEvent");
require("./app/models/cartEvent");
require("./app/models/rawClickEvent");
var mongoose = require("mongoose");

var use = require('use-import').load();
var config = use("config");

var app = express();
var port = config.port;

// Connect to rabbit mq
var RabbitMq = use("rabbitMq");
app.rabbitMq = new RabbitMq();

console.log("server configuration: " + JSON.stringify(config));

// Connect to mongodb
var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.mongodbUri, options);
};
connect();

mongoose.connection.on("error", function(err) {
    console.log("Could not connect to mongodb");
    console.log(err);
});
mongoose.connection.on("disconnected", connect);

// Bootstrap application settings
require("./config/express")(app);

// Bootstrap routes
require("./config/routes")(app);

console.log("App started on port " + port);
app.listen(port);

module.exports = app;