'use strict';

var use = require('use-import').load();
var defaultCfg = require('./defaultConfig.json');
var request = require('request-promise');
var Promise = require('bluebird');
var localConfig = use('local-config');

var getConfiguration = function(){
    var cfgPromises = Object.keys(defaultCfg.shared).map(function(key){
        return request(localConfig.configServerPath + key);
    });

    return Promise.all(cfgPromises).then(function(values){
        for(var i = 0; i < values.length; i++){
            var setting = JSON.parse(values[i]);
            if(setting && setting.length){
                defaultCfg.shared[setting[0].name] = JSON.parse(setting[0].value);
            }
        }
        return defaultCfg;
    }).catch(function(err){
        console.log('Failed to retrieve configuration: ' + err);
        console.log('Use default config');
        return defaultCfg;
    });
};

module.exports = function(){
    var mode = process.env.NODE_ENV || defaultCfg.mode || 'development';
    return mode == 'development' ? Promise.resolve(defaultCfg) : getConfiguration();
};