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

function connect(self, item) {
    var destination = item;

    var current = new WebSocket(item);
    current.on('open', function () {
        console.log("Socket: " + item + " connected!");
        self.ws.push(this);
    });
    current.on('error', function(error) {
        console.log(error);
        
        if (error.syscall && error.syscall == 'connect') {
            console.log("Schedule reconnect for socket: " + item);
            setTimeout(function () {
                connect(self, item);
            }, 5000);
        }
        else{
            self.ws.remove(current);
            connect(self, destination);
        }
    });
    current.on('close', function(code, reason) {
        console.log("Socket: " + current.hostname + " is closed.");

        var index = self.ws.indexOf(current);
        if (index !=-1) {
            self.ws.splice(index, 1);

            connect(self, destination);
        }
    });
}

StreamBroadcast.prototype.reconnect = function(){
    var self = this;
    if (this.ws){
        this.disconnectAll();
    }

    config.videoBroadcast.forEach(function(item){
        connect(self, item)
    });
}

module.exports = new StreamBroadcast();