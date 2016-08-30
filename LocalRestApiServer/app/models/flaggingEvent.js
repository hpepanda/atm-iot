"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var FlaggingEventSchema = new Schema({
    badgeId: {type: String, required: true, index: true},
    cartId: {type: String, required: false, index: true},
    kioskId: {type: String, required: false, index: true},
    date: {type: Date, required: true, index: true},
    flagType: {type: String, required: false, index: true},
    flag: {type: Schema.Types.Mixed, required: true, index: false}
});

FlaggingEventSchema.method('toClient', function () {
    var obj = this.toObject();

    //Rename fields
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;

    return obj;
});

mongoose.model('FlaggingEvent', FlaggingEventSchema);