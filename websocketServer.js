var websocketServer = function(port){
	var WebSocketServer = require('websocket').server;
	var http = require('http');
	var clients = [];
	var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
	});
	server.listen(port, function() { });

// create the server
	wsServer = new WebSocketServer({
		httpServer: server
	});

// WebSocket server
	wsServer.on('request', function(request) {
		var connection = request.accept(null, request.origin);
		clients.push(connection);
		connection.on('close', function(connection) {
			
		});
	});
	this.send = function(obj){
		 var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
	};
}
module.exports = websocketServer;