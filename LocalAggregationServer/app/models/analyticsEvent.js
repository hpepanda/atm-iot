"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AnalyticsEventSchema = new Schema({
    key: {type: String, required: true, index: true},
    value: {type: Schema.Types.Mixed, required: true, index: false},
    ip: {type: String, required: false, index: false},
    date: {type: Date, required: true, index: true}
});

mongoose.model('AnalyticsEvent', AnalyticsEventSchema);