var use = require('use-import').load();
var WebSocket = require('ws');
var config = use('app-config');
var streamUploader = use('streamUploader');
var util = require('util');
var dataCollectionNotifier = use("dataCollectionNotifier");

function StreamProcessor (address){
    this.videoClip = null;
    this.bufferOffset = null;
    this.ws = null;

    this.reconnectTimeoutHandle = null;
    this.timeout = config.reconnectTimeout;

    this.msgIntervalHandle = null;
    this.lastMsgRecievedTime = null;

    if(!address) throw new Error('Invalid url');
    this.address = address;
};

StreamProcessor.prototype.start = function(){
    console.log("Start processing");
    connect.apply(this);
};

StreamProcessor.prototype.stop = function(){
    console.log("Stop processing");
    this.ws.close();
};

function reconnect(){
    var that = this;
    this.reconnectTimeoutHandle = setTimeout(function(){
        connect.apply(that);
    }, this.timeout);

    console.log(util.format("Connection attempt. Url: %s. Timeout: %s.", this.address, this.timeout));
    this.timeout *= 2;
}

function connect(){
    var that = this;

    this.ws = new WebSocket(that.address);

    var onDisconnected = function(msg, needReconnect){
        console.log(msg);
        that.ws = null;

        if(that.videoClip && that.videoClip.currentSegment.number > 0){
            that.videoClip.finishCapturing = new Date();
            streamUploader.putManifest(that.videoClip, function(videoClip){
                dataCollectionNotifier.notify(videoClip);
            });
        }
        clearInterval(that.msgIntervalHandle);

        needReconnect && reconnect.apply(that);
    };

    var watchMsgInterval = function(){
        console.log("Watching message interval. Url: " + that.address);

        that.msgIntervalHandle = setInterval(function(){
            if(new Date() - that.lastMsgRecievedTime > config.maxMsgDelay){
                onDisconnected("No message received in given time interval.", true);
            }
            else{
                console.log("Writing stream");
            }
        }, config.maxMsgDelay);
    };

    this.ws.on('open', function(){
        console.log("WebSocket is opened. Url: " + that.address);
        watchMsgInterval(that);

        clearTimeout(this.reconnectTimeoutHandle);
        that.timeout = config.reconnectTimeout;

        if(!that.videoClip){
            that.videoClip = new VideoClip();
        }
        that.bufferOffset = 0;
    });

    this.ws.on('close', function close() {
        onDisconnected("Connection closed", false);
    });

    this.ws.on('message', function(data, flags) {
        that.lastMsgRecievedTime = new Date();

        if(that.videoClip.currentSegment.number == config.segmentNumber){
            that.videoClip.finishCapturing = new Date();
            streamUploader.putManifest({
                name: that.videoClip.name,
                start: that.videoClip.startCapturing,
                finish: that.videoClip.finishCapturing
            }, function(videoClip){
                dataCollectionNotifier.notify(videoClip);
            });
            that.videoClip = new VideoClip();
        }

        if(that.bufferOffset >= config.segmentSize){
            console.log("Put segment");
            var completedSegment = {
                number: that.videoClip.currentSegment.number,
                name: that.videoClip.name,
                data: new Buffer(that.videoClip.currentSegment.data)
            };
            streamUploader.putSegment(completedSegment);

            that.videoClip.currentSegment.number++;
            that.videoClip.currentSegment.data.fill(0);
            that.bufferOffset = 0;
        }
        if (flags.binary){
            for(var i = 0; i < data.length; i++){
                that.videoClip.currentSegment.data[that.bufferOffset++] = data[i];
            }
        }
    });

    this.ws.on('error', function(err){
        onDisconnected("Connection error: "+ err, true);
    });
};

module.exports = StreamProcessor;

function Segment(){
    this.number = 0;
    this.data = new Buffer(config.segmentSize);
    this.data.fill(0);
};

function VideoClip(){
    this.name = generateID();
    this.startCapturing = new Date();
    this.finishCapturing = null;
    this.currentSegment = new Segment();
}

function generateID() {
    var d = Date.now();
    var id = 'xxxxxxxx-'.replace(/[x]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return id;
};

