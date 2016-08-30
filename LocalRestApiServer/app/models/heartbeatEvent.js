"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HeartbeatEventSchema = new Schema({
    clientId: {type: String, required: true, index: true},
    date: {type: Date, required: true, index: true},
    ip: {type: String, required: false, index: false},
    sourceType: {type: String, required: true, index: true},
    clientName: {type: String, required: false},
    kioskId: {type: String, required: false},
    kioskName: {type: String, required: false},
    iWallId: {type: String, required: false},
    authUri: {type: String, required: false},
    host: {type: String, required: false},
    flagsContent: {type: String, required: false}
});

HeartbeatEventSchema.method('toClient', function () {
    var obj = this.toObject();

    //Rename fields
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
});


mongoose.model('HeartbeatEvent', HeartbeatEventSchema);