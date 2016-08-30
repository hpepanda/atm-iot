"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AtmSensorDataSchema = new Schema({
    atmId: {type: String, required: true, index: true},
    sensorId: {type: String, required: true, index: true},
    sensorType: {type: String, required: true, index: true},
    rawData: {type: Schema.Types.Mixed, required: false, index: false},
    date: {type: Date, required: true, index: true}
});

mongoose.model('AtmSensorData', AtmSensorDataSchema);