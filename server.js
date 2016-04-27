/**
 * Created by thinkpad on 1/12/2016.
 */
var use = require('use-import').load();
var config = use('app-config');
var StreamProcessor = use('streamProcessor');
var StreamBroadcast = use('streamBroadcast');

var streamProcessors = [];

function processVideo(){
    config().then(function(cfg) {
        cfg.shared.videoSources.forEach(function (url) {
                var streamProcessor = new StreamProcessor(url, cfg.shared);
                streamProcessor.start();
                streamProcessors.push(streamProcessor);
            }
        );
    });
};

function stopProcessing(callback){
    streamProcessors.forEach(function(streamProcessor){
        streamProcessor.stop();
    });
    callback();
};

function startNotification(){
    StreamBroadcast.reconnect();
}

function stopNotification() {
    StreamBroadcast.disconnectAll();
}

process.on ('SIGINT', function(){
    console.log("Shutdown");
    stopNotification();
    stopProcessing(function(){
        setTimeout(function(){
            process.exit(0);}, 50000);
    });

});

processVideo();
//config().then(function(cfg) {
//    if (cfg.shared.elements.broadcast) {
//        startNotification();
//    }
//});

