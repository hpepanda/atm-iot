/**
 * Created by thinkpad on 1/12/2016.
 */
var use = require('use-import').load();
var config = use('app-config');
var StreamProcessor = use('streamProcessor');

var streamProcessors = [];

function processVideo(){
    config.videoSources.forEach(function(url){
        var streamProcessor = new StreamProcessor(url);
        streamProcessor.start();
        streamProcessors.push(streamProcessor);
    });
};

function stopProcessing(callback){
    streamProcessors.forEach(function(streamProcessor){
        streamProcessor.stop();
    });
    callback();
};

processVideo();

process.on ('SIGINT', function(){
    console.log("Shutdown");
    stopProcessing(function(){
        setTimeout(function(){
            process.exit(0);}, 50000);

    });
});


