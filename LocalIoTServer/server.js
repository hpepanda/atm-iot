// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var mongoose = require("mongoose");
require("./models/atmSensorData");
require("./models/atmAggregatedData");
require("./models/atmDetails");

var compression = require('compression');
var express = require('express');
var http = require("http");
var router = express.Router();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var rest = require('./rest');
var path = require('path');



var PORT = process.env.PORT || 8041;

var app = express();

app.use(compression());

app.use(cookieParser());

app.use(morgan('tiny'));

app.use(bodyParser.json());


// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost:27017/aggregation", options);
};
connect();

mongoose.connection.on("error", console.log);
mongoose.connection.on("disconnected", connect);


app.use('', router);

var server = http.createServer(app);

rest.setup(server);

server.listen(PORT);

console.log('Server started at port:' + PORT + '...');


