"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AtmDetailsSchema = new Schema({
    atmId: {type: String, required: true, index: true},
    atmName: {type: String, required: true, index: true},
    streamUri: {type: String, required: true, index: false},
    location: {type: String, required: true, index: false},
    lastUpdate: {type: Date, required: true, index: true}
});

mongoose.model('AtmDetails', AtmDetailsSchema);