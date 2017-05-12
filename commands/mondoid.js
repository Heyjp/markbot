var User = require('../models/zomboid');
var feed = require("feed-read");
var Quotes = require('../models/quotes');
var mongoose = require('mongoose');

module.exports = {};

module.exports.getRssFeed = function(callback) {
    getFeed(function(data) {
        callback(data);
    });
}

function getFeed(callback) {
    feed("http://projectzomboid.com/blog/feed/", function(err, articles) {
        // match latest document or match the date?
        var obj = {};
        obj.title = articles[0].title;
        obj.link = articles[0].link;
        obj.date = articles[0].published;
        // Searches database for latest mondoid blog post
        // if title matches the title in db then return nothing
        // if title is different, new mondoid has been released
        // return
        checkDb(obj, function(data) {
            if (data === false) {
                callback(false);
            } else {
                callback(data);
            }
        });
    });
}

// if the db entry exists - make sure that the db no longer update
// !mondoid command becomes available pulled from the db entry.

function checkDb(obj, callback) {
    //
    User.find().sort({
        "date": -1
    }).limit(1).exec(function(err, doc) {
        var date = compareDates(obj.date, doc[0].published)
        if (err) return console.error(err);

        if (doc.length === 0) {
            User.create({
                title: obj.title,
                link: obj.link,
                published: obj.date
            }, function(err, doc) {
                // Return nothing
                return callback(false);
            });
        } else if (obj.title !== doc[0].title) {
            User.create({
                title: obj.title,
                link: obj.link,
                published: obj.date
            }, function(err, doc) {
                // Return nothing
                return callback(doc);
            });
        } else if (date === true) {
            callback(true);
        } else {
            return callback(false);
        }
    });

};

// single mondoid returned if queried
module.exports.returnMondoid = function(callback) {
    var string;
    feed("http://projectzomboid.com/blog/feed/", function(err, articles) {
        User.find().sort({
            "date": -1
        }).limit(1).exec(function(err, data) {
          console.log(data);
            if (data[0].title === data[0].title) {
                string = "The latest mondoid: " + data[0].title + " - " + data[0].link;
                callback(string)
            } else {
                string = "New Mondoid folks" + articles[0].title + " - " + articles[0].link;
                callback(string);
            }
        });
    });
}

// Check whether mondoid has been placed in db & function still runs.

function compareDates(obj, doc) {
    var todayDate = new Date();
    var date1 = new Date(obj);
    var date2 = new Date(doc);

    var newArray1 = [];
    var newArray2 = [];
    newArray1.push(date1.getDate(), date1.getMonth(), date1.getFullYear());
    newArray2.push(date2.getDate(), date2.getMonth(), date2.getFullYear());

    if (todayDate.getDate() !== date2.getDate() || todayDate.getMonth() !== date2.getMonth() || todayDate.getFullYear() !== date2.getFullYear()) {
        return false;
    }
    for (var i = 0; i < newArray1.length; i++) {
        if (newArray1[i] !== newArray2[i]) {
            return false;
        }
    }

    return true;
}


module.exports.getBuild = function() {
    var obj = {};
    var posPerks = ["1. Athletic", "2. Stout", "3. Handy", "4. Fast Learner", "5. Lucky", "6. Inconspicuous", "7. Gracious", "8. Dextrous", "9. Cats Eyes"];
    var negPerks = ["1. High Thirst", "2. Restless Sleeper", "3. Slow Healer", "4. Disorganized", "5. Hearty Appetite", "6. Prone to Illness", "7. Hemophobic", "8. Weak Stomach", "9. Cowardly", "10. Hypochondriac", "11. Slow Reader"];

    obj.pos = posPerks;
    obj.neg = negPerks;

    return obj;
}

module.exports.getRandomQuote = function(callback) {

    Quotes.find({}, function(err, data) {
        var quotes = data[0].quote;
        if (quotes.length === 0) {
            callback("There are no Quotes, please add some with !addquote :D")
        }
        var ranNum = getRandomInt(quotes.length)
        callback(ranNum + ". " + quotes[ranNum]);
    })
}


module.exports.insertQuote = function(message, callback) {
    var quote = message.substring(9, message.length).trim();
    Quotes.find({}, function(err, data) {
        var string = data[0]._id.toString();
        //var id = mongoose.Types.ObjectId(string);
        if (data.length === 0) {
            Quotes.create({
                quote: ["It's Game over man, game over!"]
            }, function(err, data) {
                console.log("quote doc created");
            });
        } else {
            var arrayLength = data[0].quote.length;
            var newString = quote;
            Quotes.update({
                "_id": string
            }, {
                $push: {
                    quote: newString
                }
            }, function(err, data) {
                console.log(data, "quote saved");
                callback("quote inserted")
            });
        }
    });
};

module.exports.delQuote = function(message, callback) {
    var index = message.replace(/[^\/\d]/g, '');
    index = parseInt(index);
    Quotes.find({}, function(err, data) {
        if (data[0].quote.length < 1) {
            callback("No quotes, please add some!");
            return;
        }
        var string = data[0]._id.toString(); +
        data[0].quote.forEach(function(x, y) {
            if (index == y) {
                data[0].quote.splice(index, 1);
            }
        });
        Quotes.findOneAndUpdate({
            "_id": string
        }, {
            $set: {
                quote: data[0].quote
            }
        }, {
            new: true
        }, function(err, doc) {
            console.log(doc);
            callback("quote deleted");
        });
    })
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
