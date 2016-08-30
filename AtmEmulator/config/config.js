"use strict";
var path = require('path');
var extend = require('util')._extend;

var localConfig = require('./localConfig');

var defaults = {
    root: path.normalize(__dirname + '/..')
};

module.exports = extend(localConfig, defaults);