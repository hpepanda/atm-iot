"use strict";

module.exports = {
    port: process.env.PORT || 5000,
    binaryServerUri: process.env.BINARY_SERVER_URI || "http://localhost:8086/analytics",
    videoServer: process.env.VIDEO_SERVER_URI || "http://localhost:5000"
};