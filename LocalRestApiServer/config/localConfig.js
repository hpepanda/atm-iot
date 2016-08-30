"use strict";

module.exports = {
    port: process.env.PORT || 8086,
    mongodbUri: process.env.MONGODB_URL ||  "mongodb://localhost:27017/aggregation",
    rabbitMqHost: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    inboundQueue: "inbound-queue",
    backupQueue: "backup-queue",
    rawQueue: "raw-queue",
    iotQueue: "iot-queue",
    exchangeName: "iSystem-exchange",
    enableBackupQueue: process.env.ENABLE_BACKUP_QUEUE || false
};