/**
 * Created by ashemyakin on 9/27/2015.
 */
var amqp = require('amqp');

var connection = null;
var connectionExchange = null;
var use = require('use-import');
var config = use("config");

function RabbitMq () {
    // TODO: Add promises to initialization
    connection = amqp.createConnection({url: config.rabbitMqHost, confirm: true});

    connection.on('error', function (err) {
        console.log("Could not connect to RabbitMQ");
        console.log(err);
        connectionExchange = null;
    });

    connection.on('ready', function () {
        console.log("RabbitMQ connected.");

        connection.exchange(config.exchangeName, { confirm: true, durable: true, autoDelete: false }, function (exchange) {
            console.log('Exchange ' + exchange.name + ' is open');
            connectionExchange = exchange;
            connection.queue(config.inboundQueue, {confirm: true, durable: true, autoDelete: false}, function (queue) {
                console.log('Queue ' + queue.name + ' is open');
                queue.bind(exchange, config.inboundQueue, function(boundQueue) {
                    console.log('Exchange ' + boundQueue.name + ' is bound');
                });
            });

            if (config.enableBackupQueue == "true") {
                connection.queue(config.backupQueue, {
                    confirm: true,
                    durable: true,
                    autoDelete: false
                }, function (queue) {
                    console.log('Queue ' + queue.name + ' is open');
                    queue.bind(exchange, config.inboundQueue, function (boundQueue) {
                        console.log('Exchange ' + boundQueue.name + ' is bound');
                    });
                });

                connection.queue(config.rawQueue, {confirm: true, durable: true, autoDelete: false}, function (queue) {
                    console.log('Queue ' + queue.name + ' is open');
                    queue.bind(exchange, config.inboundQueue, function (boundQueue) {
                        console.log('Exchange ' + boundQueue.name + ' is bound');
                    });
                });

                connection.queue(config.iotQueue, {confirm: true, durable: true, autoDelete: false}, function (queue) {
                    console.log('Queue ' + queue.name + ' is open');
                    queue.bind(exchange, config.inboundQueue, function (boundQueue) {
                        console.log('Exchange ' + boundQueue.name + ' is bound');
                    });
                });
            }
        });
    });
}

RabbitMq.prototype.SaveInboundMessage = function(dataToSave) {
    return RabbitMq.prototype.SaveToQueue(config.inboundQueue, dataToSave);
};

RabbitMq.prototype.SaveToQueue = function(queueName, dataToSave) {
    return new Promise(function (resolve, reject) {
        if(connectionExchange != null) {
            connectionExchange.publish(queueName, JSON.stringify(dataToSave), {
                deliveryMode: 2,
                mandatory: true,
                contentType: "application/json"
            }, function (isError, err) {
                if (!isError) {
                    console.log("Saved to rabbit MQ");
                    resolve();
                } else {
                    console.log("RabbitMQ saving failed: " + err);
                    reject(err);
                }
            });
        } else{
            reject(new Error("Connection is not established"))
        }
    });
};

module.exports = RabbitMq;