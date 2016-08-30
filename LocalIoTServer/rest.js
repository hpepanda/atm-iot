// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var express = require('express');
var moment = require('moment');
var router = express.Router();
var ws = require("ws");
var stringify = require("json-stringify-pretty-compact");
var realtimeAlerts = require('./realtimeAlerts');
var history = require('./history');

var socketServer;

function closeConnection(connection) {
    if (connection.ws) {
        if(connection.realtimeAlertsInterval){
            clearInterval(connection.realtimeAlertsInterval);
        }

        if(connection.realtimeHistoryInterval){
            clearInterval(connection.realtimeHistoryInterval);
        }
        connection.ws.close();
        connection.ws = null;
    }
}

function handleFakeAtmsAlerts(connection, events, callback) {
    var category = 'atms_alerts';

    if (!connection.data[category]) {
        realtimeAlerts.getAtmAlerts(connection, function (err, result) {
            if (!err) {
                connection.data[category] = result;

                if(!connection.isAtmStarted && !connection.realtimeAlertsInterval) {
                    connection.realtimeAlertsInterval = setInterval(function () {
                        connection.isAtmStarted = true;
                        realtimeAlerts.getAtmAlerts(connection, function (atmErr) {
                            if (!atmErr) {
                                    connection.requests.forEach(function (request) {
                                        if (requestMatches(request, events)) {
                                            respondToRequest(connection, request);
                                        }
                                    });
                            }
                        });
                    }, 4 * 1000);
                }

                callback(null, result);
            } else {
                callback(err);
            }
        });
    } else {
        realtimeAlerts.getAtmAlerts(connection, function(realtimeErr, realtimeRes){
            if(!realtimeErr) {
                callback(null, realtimeRes);
            } else {
                callback(realtimeErr);
            }
        });
    }
}

function handleFakeAtmHistoryDetails(connection, events, callback) {
    history.getHistory(connection, events, callback);
}

function handleFakeCriticalAlerts(connection, events, callback) {
    var category = 'critical_alerts';

    if (!connection.data[category]) {

        history.getCriticalAlerts(connection, function(err, resp){
            connection.data[category] = resp;

            if(!err) {
                if(!connection.isCriticalStarted && !connection.realtimeHistoryInterval) {
                    connection.realtimeHistoryInterval = setInterval(function () {
                        connection.isCriticalStarted = true;
                        history.getCriticalAlerts(connection, function (realtimeErr) {
                            if (!realtimeErr) {
                                connection.requests.forEach(function (request) {
                                    if (requestMatches(request, events)) {
                                        respondToRequest(connection, request);
                                    }
                                });
                            }
                        });
                    }, 15 * 1000);
                }
                callback(null, resp);
            } else {
                callback(err);
            }
        });
    } else {
        history.getCriticalAlerts(connection, function(realtimeErr, realtimeRes){
            if(!realtimeErr) {
                callback(null, realtimeRes);
            } else {
                callback(realtimeErr);
            }
        });
    }
}

function processResponse(request, connection, callback) {
    var response = {op: 'update', id: request.id};

    var events = [{
        category: request.params.category,
        start: request.params.start,
        end: request.params.end,
        clientId: request.params.clientId,
        timeframe: request.params.timeframe,
        uri: request.url,
        date: request.params.date,
        time: request.params.time,
        atmId: request.params.atmId,
        skip: request.params.skip
    }];

    try {
        if ('/rest/index/aggregated' === request.url) {

            if (!connection.data) {
                connection.data = {};
            }

            var dataCallback = function (err, result) {
                if(!err) {
                    response.result = result;
                } else{
                    response.op = 'error';
                    response.result = 'could not retrieve alerts data';
                }

                callback(response);
            };

            switch (request.params.category) {
                case 'critical_alerts':
                    connection.timeframe = request.params.timeframe;
                    handleFakeCriticalAlerts(connection, events, dataCallback);
                    break;
                case 'atms_alerts':
                    handleFakeAtmsAlerts(connection, events, dataCallback);
                    break;
                case 'atms_history_details':
                    handleFakeAtmHistoryDetails(connection, events, dataCallback);
                    break;
            }

        } else {
            response.op = 'error';
            response.result = 'unknown url ' + request.url;
            callback(response);
        }
    } catch (e) {
        response.op = 'error';
        response.result = e.message;
        callback(response);
    }
}

function respondToRequest(connection, request) {
    processResponse(request, connection, function (response) {
        if (connection.ws) {
            try {
                var serializedResponse = JSON.stringify(response);
                //console.log(serializedResponse);
                console.log(response.op.toUpperCase(), request.url,
                    stringify(request.params), serializedResponse.length);
                connection.ws.send(serializedResponse);
            } catch (err){
                console.log(err);
            }
        }

        if ('error' === response.op) {
            closeConnection(connection);
        }
    });
}

function onMessage(connection, request) {
    if ('start' === request.op) {
        console.log(new Date(), 'WATCH', request.url, request.id, stringify(request.params));

        if(request.url == "atms_alerts" && connection.realtimeAlertsInterval){
            clearInterval(connection.realtimeAlertsInterval);
        }

        if(request.url == "critical_alerts" && connection.realtimeHistoryInterval){
            clearInterval(connection.realtimeHistoryInterval);
        }

        for (var i = 0; i < connection.requests.length; i++) {
            if(connection.requests[i].url == request.url && connection.requests[i].params.category == request.params.category) {
                connection.requests.splice(i, 1);
                break;
            }
        }

        connection.requests.push(request);
        respondToRequest(connection, request);
    } else if ('stop' === request.op) {
        console.log(new Date(), 'STOP', request.id);
        // Remove request

        if(request.url == "atms_alerts" && connection.realtimeAlertsInterval){
            clearInterval(connection.realtimeAlertsInterval);
        }

        if(request.url == "critical_alerts" && connection.realtimeHistoryInterval){
            clearInterval(connection.realtimeHistoryInterval);
        }

        connection.requests = connection.requests.filter(function (req) {
            return (req.id !== request.id);
        });
    } else {
        if (connection.ws) {
            connection.ws.send({error: 'unknown op ' + request.op});
            closeConnection(connection);
        }
    }
}

function onConnection(ws) {
    var connection = {
        ws: ws,
        requests: []
    };

    ws.on('message', function incoming(message) {
        onMessage(connection, JSON.parse(message));
    });

    ws.on("close", function () {
        closeConnection(connection);
    });
}

function initializeSocket(server) {
    socketServer = new ws.Server({server: server, path: "/rest/ws"});
    socketServer.on("connection", onConnection);
}

function requestMatches(request, events) {
    // If the request category(ies) or the request url match the change, respond
    var category;
    var uri;
    if (request.params && request.params.category) {
        category = request.params.category;
    } else {
        uri = request.url;
    }
    return events.some(function (event) {
        if (category) {
            return (category === event.category ||
            (Array.isArray(category) &&
            category.indexOf(event.category) !== -1));
        } else {
            return (uri === event.uri);
        }
    });
}

module.exports = {
    router: router,
    setup: function (server) {
        initializeSocket(server);
    }
};
