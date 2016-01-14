"use strict";

var request = require('request');
var fs = require('fs');
var use = require('use-import');
var config = use('app-config');

var authData = config.authData;

var authorize = function (callback) {
    // Prevent token expiration
    var now = new Date();
    var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), 0, 0);

    if (!authData.token || !authData.expires || authData.expires >= now_utc) {
        var reqestParams = {
            method: 'GET',
            url: authData.authUri,
            headers: {
                'x-auth-user': authData.login,
                'x-auth-key': authData.password
            }
        };

        request(reqestParams, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var authResponse = JSON.parse(body);
                authData.token = authResponse.access.token.id;
                authData.expires = Date.parse(authResponse.access.token.expires);
                callback(null, authData);
            } else {
                callback("Could not acquire an access token.");
            }
        });
    } else {
        callback(null, authData);
    }
};

exports.putSegment = function(segment, callback){
    authorize(function(err, authData){
        if(!err){
            var segmentName =  segment.name+'seg-' + segment.number;
            var reqOptions = {
                method: 'PUT',
                url: authData.containerUri + segmentName,
                headers: {
                    'X-Auth-Token': authData.token
                },
                body: segment.data
            };

            request(reqOptions, function (error, response) {
                if (!error && response.statusCode == 201) {
                    console.log(segmentName + ": segment uploaded");
                } else {
                    console.log(segmentName + ": segment upload failed");
                    if(error){
                        console.log(error);
                    }else{
                        console.log(response);
                    }
                }
            });
        }
        else{
            console.log("Auth failed: " + err);
        }

    });
};

exports.putManifest = function(streamName, callback){
    authorize(function(err, authData){
        if(!err){
            var fileName = streamName.slice(0, -1) + '.mpg'
            var reqOptions = {
                method: 'PUT',
                url: authData.containerUri + fileName,
                headers: {
                    'X-Auth-Token': authData.token,
                    'Content-Length': 0,
                    'X-Object-Manifest': 'iot-video/'+streamName + 'seg-',
                    'Content-Type': 'video/mpeg'
                }
            };

            request(reqOptions, function (error, response) {
                if (!error && response.statusCode == 201) {
                    console.log(fileName + ": manifest uploaded");
                    console.log(response);
                } else {
                    console.log(fileName + ": manifest upload failed");
                    if(error){
                        console.log(error);
                    }else{
                        console.log(response);
                    }
                }
            });
        }
        else{
            console.log("Auth failed: " + err);
        }
    });
};