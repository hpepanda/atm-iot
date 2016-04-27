"use strict";

var request = require('request');
var use = require('use-import');
var config = use('app-config');

var createAuthBody = function(userId, password, projectId) {
    return {
            "auth": {
                "identity": {
                    "methods": ["password"],
                    "password": {
                        "user": {
                            "id": userId,
                            "password": password
                        }
                    }
                },
                "scope": {
                    "project": {
                        "id": projectId
                    }
                }
            }
    };
}


var authData = {};
var authorize = function (callback) {
    config().then(function(cfg) {
        // Prevent token expiration
        var now = new Date();
        var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), 0, 0);
        var osAuthCfg = cfg.shared.authData;
        if (!authData.token || !authData.expires || authData.expires >= now_utc) {
            var auth = createAuthBody(osAuthCfg.userId, osAuthCfg.password, osAuthCfg.projectId);

            var requestParams = {
                method: 'POST',
                url: osAuthCfg.authUri,
                body: JSON.stringify(auth)
            };

            request(requestParams, function (error, response, body) {
                if (!error && response.statusCode == 201) {
                    var authResponse = JSON.parse(body);

                    authData.token = response.headers['x-subject-token'];
                    authData.expires = Date.parse(authResponse.token.expires_at);
                    callback(null, {auth: authData, osAuthCfg: osAuthCfg});
                } else {
                    callback("Could not acquire an access token.");
                }
            });
        } else {
            callback(null, {auth: authData, osAuthCfg: osAuthCfg});
        }
    });



};

exports.putSegment = function(segment, callback){
    authorize(function(err, data){
        if(!err){
            var segmentName =  segment.name+'seg-' + segment.number;
            var reqOptions = {
                method: 'PUT',
                url: data.osAuthCfg.containerUri + segmentName,
                headers: {
                    'X-Auth-Token': data.auth.token
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

exports.putManifest = function(videoClip, callback){
    authorize(function(err, data){
        if(!err){
            var fileName = videoClip.name.slice(0, -1) + '.mpg'
            var reqOptions = {
                method: 'PUT',
                url: data.osAuthCfg.containerUri + fileName,
                headers: {
                    'X-Auth-Token': data.auth.token,
                    'Content-Length': 0,
                    'X-Object-Manifest': data.osAuthCfg.containerName + '/' + videoClip.name + 'seg-',
                    'Content-Type': 'video/mpeg'
                }
            };

            request(reqOptions, function (error, response) {
                if (!error && response.statusCode == 201) {
                    console.log(fileName + ": manifest uploaded");
                    videoClip.uri = response.request.href;
                    console.log(response.request.href);
                    callback(videoClip);
                } else {
                    console.log(fileName + ": manifest upload failed");
                    if(error){
                        console.log(error);
                    }
                    else{
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