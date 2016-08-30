"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CartEventSchema = new Schema({
    clientId: {type: String, required: true, index: true},
    badgeId: {type: String, required: true, index: true},
    status: {type: String, required: true, index: true},
    assets: {type: Schema.Types.Mixed, required: false, index: false},
    ip: {type: String, required: false, index: false},
    date: {type: Date, required: true, index: true}
});

mongoose.model('CartEvent', CartEventSchema);