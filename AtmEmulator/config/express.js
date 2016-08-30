"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");

var use = require("use-import");
var cors = use("cors");

module.exports = function (app) {
    app.use(bodyParser.json({ type: 'application/json', limit: '10mb' }));
    app.use(cors.addHeader);
};