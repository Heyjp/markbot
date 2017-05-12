var Compulsion = require('../models/compulsionDb');

var ultimateArray = [];

module.exports.addCompulsion = function(entry, callback) {
    var newEntry = entry.substring(4, entry.length).trim();

    Compulsion.find({}, function(err, doc) {

        if (doc.length === 0) {
            Compulsion.create({
                compulsion: [],
                forfeits: [],
                suggestions: []
            }, function(err, info) {
                console.log("doc added");
                callback("doc inserted, why did you delete it!!!")
            })
        } else {
        var docId = doc[0]._id.toString();
          Compulsion.update({
              "_id": docId
          }, {
              $push: {
                  compulsion: newEntry
              }
          }, function(err, data) {
              callback("Compulsion added")
          });
        }
    });
}


module.exports.getCompulsions = function(results, callback) {
    Compulsion.find({}, function(err, data) {
        var userEntries = getRandomEntries(data[0].compulsion, results);
        callback(userEntries);
    });
}


module.exports.addForfeit = function(entry, callback) {
    var newEntry = entry.substring(11, entry.length).trim();

    Compulsion.find({}, function(err, doc) {
        if (doc.length === 0) {
            Compulsion.create({
                compulsion: [],
                forfeits: [],
                suggestions: []
            }, function(err, info) {
                console.log("doc added");
                callback("doc inserted, why did you delete it!!!")
            })
        } else {
        var docId = doc[0]._id.toString();
          Compulsion.update({
              "_id": docId
          }, {
              $push: {
                  forfeits: newEntry
              }
          }, function(err, data) {
              callback("Forfeit added")
          });
        }
    });
}

module.exports.getForfeits = function(results, callback) {
    Compulsion.find({}, function(err, data) {
        var userEntries = getRandomEntries(data[0].forfeits, results);
        callback(userEntries);
    })
}


module.exports.addSuggestion = function(entry, callback) {
    var newEntry = entry.substring(8, entry.length).trim();

    Compulsion.find({}, function(err, doc) {
        if (doc.length === 0) {
            Compulsion.create({
                compulsion: [],
                forfeits: [],
                suggestions: []
            }, function(err, info) {
                console.log("doc added");
                callback("doc inserted, why did you delete it!!!")
            })
        } else {
        var docId = doc[0]._id.toString();
          Compulsion.update({
              "_id": docId
          }, {
              $push: {
                  suggestions: newEntry
              }
          }, function(err, data) {
              callback("Suggestion added")
          });
        }
    });
}

module.exports.getSuggestions = function(callback) {
    Compulsion.find({}, function(err, data) {
        callback(data[0].suggestions);
    })
}


module.exports.ultimateCompulsions = function (callback) {

  // Checks whether game is running or not.
  if (ultimateArray.length === 0) {
    Compulsion.find({}, function(err, doc) {
        if (doc.length === 0) {
            console.log("empty doc, returning");
            return;
        }
      console.log("initializing compulsions, array is empty, inserting docs")
      // Take all the compulsions and put them in the compulsions array.
      ultimateArray = doc[0].compulsion
      // filter through the array and send the filtered results to callback. Update current ultimateArray with spliced results
      var choices = ultimateEntries(ultimateArray);
      callback(choices);
    });
  } else {
    // return 5 new entries
    console.log("game is running, array has entries");
    var choices = ultimateEntries(ultimateArray);
    callback(choices);
  }
}

function ultimateEntries(array) {

    var choicesArray = [];
    var randomNum;
    for (var i = 0; i < 5; i++) {
        if (array.length > 0) {
            randomNum = getRandomInt(array.length);
            choicesArray.push(array[randomNum]);
            array.splice(randomNum, 1);
        } else {
            return "no more entries";
        }
    }
    console.log(ultimateArray.length);
    return choicesArray;
}

module.exports.resetChallenge = function (callback) {
  resetArray();
  callback("Success");
}


function resetArray () {
  return ultimateArray = [];
}



function getRandomEntries(array, entries) {
    var newArray = array;
    var choicesArray = [];
    var randomNumArray = [];
    var randomNum;
    for (var i = 0; i < entries; i++) {
        if (newArray.length > 0) {
            randomNum = getRandomInt(newArray.length);
            choicesArray.push(newArray[randomNum]);
            newArray.splice(randomNum, 1);
            randomNumArray.push(randomNum);
        } else {
            return choicesArray;
        }
    }
    return choicesArray;
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
