"use strict";

module.exports = {
    mongodbUri: process.env.MONGODB_URL ||  "mongodb://localhost:27017/aggregation",
    rabbitMqHost: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    inboundQueue: "inbound-queue"
};