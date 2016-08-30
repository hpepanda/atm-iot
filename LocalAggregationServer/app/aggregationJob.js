/**
 * Created by ashemyakin on 10/5/2015.
 */
var use = require('use-import');
var KeyValueAggregator = use("keyValueAggregator");
var HeartbeatAggregator = use("heartbeatAggregator");
var FlaggingAggregator = use("flaggingAggregator");
var ClickAggregator = use("clickAggregator");
var AtmAggregator = use("atmAggregator");
var CartsAggregator = use("cartsAggregator");

var aggregationJobs = null;

function AggregationJob() {
    aggregationJobs = new Array();
    aggregationJobs.push(new KeyValueAggregator());
    aggregationJobs.push(new HeartbeatAggregator());
    aggregationJobs.push(new FlaggingAggregator());
    aggregationJobs.push(new ClickAggregator());
    aggregationJobs.push(new CartsAggregator());
    aggregationJobs.push(new AtmAggregator());
}

AggregationJob.prototype.process = function (dataKey, dataValue, date, ip) {
    return new Promise(function (resolve) {
        var toProcess = new Array();
        for (var i = 0; i < aggregationJobs.length; i++) {
            toProcess.push(aggregationJobs[i].process(dataKey, dataValue, date, ip));
        }

        Promise.all(toProcess).then(function () {
            console.log(dataKey + ": aggragated");
            resolve();
        });
    });
};

module.exports  = AggregationJob;