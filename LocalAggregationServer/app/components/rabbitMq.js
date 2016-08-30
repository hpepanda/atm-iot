/**
 * Created by ashemyakin on 9/27/2015.
 */
var amqp = require('amqp');

var connection = null;
var connectionExchange = null;
var config = null;
var aggregationJob = null;

function RabbitMq(rabbitMqConfig, job) {
    config = rabbitMqConfig;
    aggregationJob = job;

    // TODO: Add promises to initialization
    connection = amqp.createConnection({url: config.rabbitMqHost, confirm: true});

    connection.on('error', function (err) {
        console.log(err);
        connectionExchange = null;
    });

    connection.on('ready', function () {
        console.log("RabbitMQ connected.");

        connection.queue(config.inboundQueue, {confirm: true, durable: true, autoDelete: false}, function (q) {
            q.bind('#');

            q.subscribe({ack: true, prefetchCount: 1}, function (message, headers, deliveryInfo, messageObject) {
                if (!aggregationJob) {
                    messageObject.reject(true);
                    console.log("Could not find aggregation job. Message rejected.");
                } else {
                    console.log("Start processing message.");
                    aggregationJob.process(message.key, message.value, message.date, message.ip).then(function () {
                        messageObject.acknowledge(false);
                        console.log("Message processed.");
                    }).catch(function () {
                            messageObject.reject(true);
                            console.log("Error while processing aggregation job. Message rejected.");
                    });
                }
            });
        });
    });
}

module.exports = RabbitMq;