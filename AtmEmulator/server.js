"use strict";

var http = require('http');
var express = require('express');
var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

var use = require('use-import').load();
var config = use("config");

var port = config.port;

console.log("server configuration: " + JSON.stringify(config));

// Bootstrap application settings
require("./config/express")(app);

// Bootstrap routes
require("./config/routes")(app, io);

console.log("App started on port " + port);
//app.listen(port);
server.listen(port);

module.exports = app;