"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AtmAggregatedDataSchema = new Schema({
    atmId: {type: String, required: true, index: true},
    peopleCount: {type: Number, required: true, index: true},
    shakesCount: {type: Number, required: true, index: true},
    warning: {type: Number, required: true, index: true},
    critical: {type: Number, required: true, index: false},
    date: {type: Date, required: true, index: true}
});

mongoose.model('AtmAggregatedData', AtmAggregatedDataSchema);