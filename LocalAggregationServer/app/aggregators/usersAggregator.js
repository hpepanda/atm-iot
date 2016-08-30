/**
 * Created by ashemyakin on 10/5/2015.
 */
var mongoose = require("mongoose");
var UserModel = mongoose.model("User");

function UsersAggregator() {
    console.log("Users aggregator initialized.")
}

UsersAggregator.prototype.process = function (dataKey, dataValue) {
    return new Promise(function (resolve) {
        if (dataKey != "iWallClickEvent" || dataValue.length > 5000) {
            console.log("Message too long.");
            resolve();
            return;
        }

        try {
            var parsedEvent = JSON.parse(dataValue);
            if (parsedEvent.user) {
                var parsedUser = JSON.parse(parsedEvent.user);
                if (parsedUser && parsedUser.badgeId) {
                    UserModel.update({userId: parsedUser.badgeId}, {
                        fname: parsedUser.fname,
                        lname: parsedUser.lname,
                        organization: parsedUser.org,
                        twitter: parsedUser.twitter
                    }, {upsert: true}, function (saveError) {
                        if (!saveError) {
                            console.log("User saved: " + parsedUser.badgeId);
                            resolve();
                        }
                        else {
                            console.log("User saving failed: " + parsedUser.badgeId);
                            console.log(saveError);
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        } catch (error) {
            console.log("Could not save user");
            console.log(error);
            resolve();
        }
    });
};

module.exports = UsersAggregator;
