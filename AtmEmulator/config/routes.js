"use strict";

var use = require("use-import");
var config = use("config");
var fs = require('fs');
//controllers
var AtmSimulatorController = use("atmSimulatorController");


module.exports = function (app, io) {


    var atmSimulatorController = new AtmSimulatorController(io);

    /// test server connection
    app.get("/", function (req, res) {
        res.sendFile('index.html', { root: config.root + "/public" });
    });

    app.get("/socket.io.js", function (req, res) {
        res.sendFile('socket.io.js', { root: config.root + "/public" });
    });

    app.get("/big-buck-bunny.mpg", function (req, res) {
        res.sendFile('big-buck-bunny.mpg', { root: config.root + "/public" });
    });

    app.get("/waiting.mpg", function (req, res) {
        res.sendFile('waiting.mpg', { root: config.root + "/public" });
    });

    app.get("/active.mpg", function (req, res) {
        res.sendFile('active.mpg', { root: config.root + "/public" });
    });

    app.get("/demo.mpg", function (req, res) {
        res.sendFile('demo.mpg', { root: config.root + "/public" });
    });


    app.get("/startSensors", function(req, res, next) {
        atmSimulatorController.sendSensorsData();
        res.end();
    });

    app.get("/startEmpty", function(req, res, next) {
        atmSimulatorController.sendEmptyData();
        res.end();
    });

    app.get("/stop", function(req, res, next) {
        atmSimulatorController.stopSimulation();
        res.end();
    });

    app.get("/demo", function(req, res, next) {
        atmSimulatorController.startDemo();
        res.end();
    });

    /// catch 404 and forwarding to error handler
    app.use(function (req, res) {
        res.status(404).send({ error: "not found" });
    });

    /// catch unhandled errors and forwarding to error handler
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.send({ error: err.message });
    });
};