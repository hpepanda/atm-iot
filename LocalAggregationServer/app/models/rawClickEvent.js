"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RawClickEventSchema = new Schema({
    outerHtml: {type: String, required: true, index: false},
    clientId: {type: String, required: true, index: true},
    ip: {type: String, required: false, index: false},
    date: {type: Date, required: true, index: true},
    uri: {type: String, required: false, index: false},
    clientDate: {type: Date, required: false, index: false},
    user: {type: Schema.Types.Mixed, required: false, index: false}
});

mongoose.model('RawClickEvent', RawClickEventSchema);