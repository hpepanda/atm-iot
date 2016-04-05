var http = require('http');
var qs = require('querystring');
var acust = require('./acustic');
var fs = require('fs');
var settings = require('./settings');
var acustic = new acust(8);
var imageserver = require('./imageServer');
var imageServer = new imageserver();
var peoplecounter = require("./peopleCounter");
var peopleCounter = new peoplecounter();
var datasender = require('./dataSender');
var dataSender = new datasender();
var socket = require('./websocketServer');
var websocket = new socket(9065);
var imagesender = require('./imageSender');
var imageSender = new imagesender(websocket);


http.createServer(function (request, response) {
    if (request.method == 'POST') {
		
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e7)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
			var data = eval(post);
			console.log(data.key);
			if(data.key != settings.clientId)
			{
				return;
			}
			data = eval(data.value);
			acustic.addData(data);
			response.writeHead(201, {'Content-Type': 'text/plain'});
			response.end('Hell Camera Server\n');
			body = '';
        });
    }
	
}).listen(settings.accusticPort,'0.0.0.0');

console.log('Server running on port',settings.serverPort);
console.log('Accustic running on port',settings.accusticPort);

http.createServer(function (request, response) {
	
    if (request.method == 'POST') {
        var body = '';
		var destinationFile = fs.createWriteStream(settings.imagePath);
		request.pipe(destinationFile);

        request.on('end', function () {
			
			console.log("hey photo");
			// count people by accoustic and piro signals
			var countAc = peopleCounter.calculateAcoustic(acustic.getData());
			console.log("Acc count "+countAc);
			// count faces by image
			var faces = imageServer.CalculateFaces(countAc);
			console.log('Face count '+faces);
			// merge data
			var count = peopleCounter.calculateMerge(countAc,faces);
			console.log('People count ',count);
			dataSender.send(8,acustic.getData(),count);
			acustic.clear();
			imageSender.sendBybase64('photo1.png',count);
			response.writeHead(201, {'Content-Type': 'text/plain'});
			response.end('Hell World\n');
        });
    }
	else{
		response.writeHead(201, {'Content-Type': 'text/plain'});
		response.end('Hell World\n');
	}
	
}).listen(settings.raspicamPort,'0.0.0.0');
console.log('Raspicam server running on port',settings.raspicamPort);
