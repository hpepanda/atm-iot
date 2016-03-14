// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

var express = require('express');
var moment = require('moment');
var router = express.Router();
var ws = require("ws");
var stringify = require("json-stringify-pretty-compact");

// WebSocket interaction

var socketServer;
var connections = [];

function closeConnection (connection) {
  if (connection.ws) {
    connection.ws.close();
    connection.ws = null;
    var index = connections.indexOf(connection);
    connections.splice(index, 1);
  }
}

function handleFakeAtmsAlerts(connection, events) {
  var category = 'atms_alerts';

  if (!connection.data[category]) {
    connection.data[category] = [
      {
        name: 'ATM 1',
        location: 'TA1 Helion Demo',
        series: [{
          status: 'error',
          value: 2
        },
        {
          status: 'warning',
          value: 7
        }]
      },
      {
        name: 'ATM 2',
        location: 'TA1 Demo Area 2',
        series: [{
          status: 'error',
          value: 4
        },
        {
          status: 'warning',
          value: 3
        }]
      }
    ];

    setInterval(function () {

      var index = Math.round(Math.random());
      var currentData = connection.data[category];

      if (currentData) {
        var alert = currentData[index];
        alert.series[index].value += index + 1;

        connections.forEach(function (connection) {
          connection.requests.forEach(function (request) {
            if (requestMatches(request, events)) {
              respondToRequest(connection, request);
            }
          });
        });
      }
    }, 30000);
  }
}

function handleFakeCriticalAlerts(connection, events) {

  var category = 'critical_alerts';

  if (!connection.data[category]) {

    connection.data[category] = [{
      count: 150,
      intervals: []
    }];

    var currentData = connection.data[category][0];

    var pastHours = 12;
    while (pastHours > 0) {
      currentData.intervals.push({
        count: Math.floor((Math.random() * 10) + 1),
        start: moment().subtract(pastHours, 'h'),
        end: moment().subtract(pastHours - 1, 'h')
      });

      pastHours--;
    }

    connection.previousHour = moment().hour();

    setInterval(function () {

      var alerts = currentData;

      if (alerts) {
        var offset = Math.round(Math.random());
        alerts.intervals[alerts.intervals.length - 1].count += offset;

        connections.forEach(function (connection) {
          connection.requests.forEach(function (request) {
            if (requestMatches(request, events)) {
              respondToRequest(connection, request);
            }
          });
        });
      }
    }, 120000);

  } else if (connection.previousHour &&
    connection.previousHour !== moment().hour()) {
    currentData.intervals.push({
      count: Math.floor((Math.random() * 10) + 1),
      start: moment().subtract(1, 'h'),
      end: moment()
    });

    currentData.intervals.shift();

  }
}

function respondToRequest (connection, request) {
  var response = {op: 'update', id: request.id};

  var events = [{
    category: request.params.category,
    uri: request.url
  }];

  try {
    if ('/rest/index/aggregated' === request.url) {

      if (!connection.data) {
        connection.data = {};
      }

      switch (request.params.category) {
        case 'critical_alerts':
          handleFakeCriticalAlerts(connection, events);
          break;
        case 'atms_alerts':
          handleFakeAtmsAlerts(connection, events);
          break;
      };

      response.result = connection.data[request.params.category];

    } else {
      response.op = 'error';
      response.result = 'unknown url ' + request.url;
    }
  } catch (e) {
    response.op = 'error';
    response.result = e.message;
  }

  if (connection.ws) {
    var serializedResponse = JSON.stringify(response);
    console.log(response.op.toUpperCase(), request.url,
      stringify(request.params), serializedResponse.length);
    connection.ws.send(serializedResponse);
  }

  if ('error' === response.op) {
    closeConnection(connection);
  }
}

function onMessage (connection, request) {
  if ('start' === request.op) {
    console.log('WATCH', request.url, request.id, stringify(request.params));
    connection.requests.push(request);
    respondToRequest(connection, request);
  } else if ('stop' === request.op) {
    console.log('STOP', request.id);
    // Remove request
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

function onConnection (ws) {
  var connection = {
    ws: ws,
    requests: []
  };
  connections.push(connection);

  ws.on('message', function incoming(message) {
    onMessage(connection, JSON.parse(message));
  });

  ws.on("close", function () {
    closeConnection(connection);
  });
}

function initializeSocket (server) {
  socketServer = new ws.Server({server: server, path: "/rest/ws"});
  socketServer.on("connection", onConnection);
}

function requestMatches (request, events) {
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
