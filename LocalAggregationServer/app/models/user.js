"use strict";

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    badgeId: {type: String, required: true, unique: true, index: true},
    fname: {type: String, required: true, index: true},
    lname: {type: String, required: true, index: true},
    organization: {type: String, required: false},
    title: {type: String, required: false},
    email: {type: String, required: false},
    phone: {type: String, required: false},
    address: {type: String, required: false},
    twitter: {type: String, required: false},
    tweetScore: {type: Boolean, required: false},
    displayName: {type: String, required: false}
});

mongoose.model('User', UserSchema);