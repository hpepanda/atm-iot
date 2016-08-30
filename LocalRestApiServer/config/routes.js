"use strict";

var use = require("use-import");
var AnalyticsController = use("analyticsController");
var HeartbeatController = use("heartbeatController");
var FlaggingController = use("flaggingController");
var ReportsController = use("reportsController");

module.exports = function (app) {
    var analyticsController = new AnalyticsController(app.rabbitMq);
    var heartbeatController = new HeartbeatController();
    var flaggingController = new FlaggingController();
    var reportsController = new ReportsController();
    /// test server connection
    app.get("/", function (req, res) {
        res.json({ message: "I'm working!" });
    });

    app.get("/flagging", flaggingController.Get);
    app.get("/heartbeat", heartbeatController.Get);
    app.get("/configuration/android", heartbeatController.GetAdnroidConfig);
    app.get("/configuration/serverTime", heartbeatController.GetServerTime);

    app.post("/analytics", analyticsController.Create);
    app.get("/reports", reportsController.Get);

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