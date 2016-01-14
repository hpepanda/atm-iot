/**
 * Created by thinkpad on 1/12/2016.
 */
var use = require('use-import').load();
var config = use('app-config');
var WebSocket = require('ws');
var fs = require('fs');
var streamUploader = use('streamUploader');

var createSegment = function(){
    return {
        name: generateID(),
        number: 0,
        data: new Buffer(config.segmentSize)
    };
};

var generateID = function () {
    var d = Date.now();
    var id = 'xxxxxxxx-'.replace(/[x]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return id;
};

var currentSegment = createSegment();

ws = new WebSocket(config.videoSource);
ws.on('open', function(){
    console.log('WebSocket is opened');
});

ws.on('close', function close() {
    console.log('disconnected');
});

var bufferOffset = 0;
ws.on('message', function(data, flags) {
    if(currentSegment.number == 5){
        console.log("Put manifest");
        streamUploader.putManifest(currentSegment.name);
        currentSegment = createSegment();
        bufferOffset = 0;
    }
    if(bufferOffset >= config.segmentSize){
        console.log("Put segment");
        streamUploader.putSegment(currentSegment);
        currentSegment.number++;
        currentSegment.data = new Buffer(config.segmentSize);
        bufferOffset = 0;
    }
    if (flags.binary){
        for(var i = 0; i < data.length; i++){
            currentSegment.data[bufferOffset++] = data[i];
        }
    }
});

