var use = require('use-import').load();
var WebSocket = require('ws');
var config = use('app-config');

function StreamBroadcast() {
    this.ws = [];
}

StreamBroadcast.prototype.notify = function(message) {
    if (this.ws) {
        this.ws.forEach(function(item){
            item.send(message);
        });
    }
};

StreamBroadcast.prototype.disconnectAll = function(){
    var wsList = this.ws;
    this.ws = [];

    wsList.forEach(function(item) {
        item.close();
    })
}

StreamBroadcast.prototype.reconnect = function(){
    var self = this;

    if (this.ws){
        this.disconnectAll();
    }

    config.videoBroadcast.forEach(function(item){
        var current = new WebSocket(item);
        current.on('open', function () {
            self.ws.push(this);
        });
        current.on('error', function(error) {
            console.log(error);
        });
    });
}

module.exports = new StreamBroadcast();