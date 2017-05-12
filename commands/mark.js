var tmi = require('tmi.js');
var config = require('../config/options');
var Mondoid = require('../commands/mondoid');
var Compulsion = require('../commands/compulsions');
var CronJob = require('cron').CronJob;

// new CronJob('* */5 17-23 * * 1', function () {});
var job;

// DeathRoad Variables
var drive = false;
var driveArray = [];

// RimWorld Varibales
var rim = false;
var rimArray = [];

// Timer Variables
var timer;
var caller;
var timeCounter;

// command delay
var cmdTimestamps = {};

// Zomboid Variables
var suggestionArray = [];
var counter = 1;
var userEntries = [];
var userArray = [];
var compulsionList = [];
var suggestArray = [];

var i = 0;
var messageCron;

var client = new tmi.client(config.options);
client.connect();


// ===================================================================================================================================================================
// ------------------------------------------------- General COMMANDS ----------------------------------------------------------------------------------------------
// ===================================================================================================================================================================

// ===================================================================================================================================================================
// ------------------------------------------------- Deathroad Commands ----------------------------------------------------------------------------------------------
// ===================================================================================================================================================================

client.on('chat', function(channel, user, message, self) {
    if (user['user-type'] === "mod" || channel.replace("#", "") === user.username) {
        if (message === "!death" && drive === false) {
            drive = true;
            client.say('mark_exe', "Congratulations You've started a new queue for the death road. Type !join to jump on the death train. You have one minute until close");
            setTimeout(function() {
                client.say('mark_exe', "The train is leaving the station, " + driveArray.length + " fools say goodbye to everything they know and love. Joining is closed!");
                setTimeout(function() {
                    if (driveArray.length < 1) {
                        client.say('mark_exe', "You're flying solo on this one Mark, good luck!");

                    } else {
                        var ranNum = getRandomInt(driveArray.length);
                        client.say('mark_exe', "Congratulations to " + driveArray[ranNum] + " for choosing to die. May the odds be in your favour young padawan!");
                    }
                    drive = false;
                }, 5000);
            }, 60000);
        }
    }
});

client.on('chat', function(channel, user, message, self) {
    if (message === "!join" && drive === true) {
        driveArray.push(user["display-name"]);
    }
});

// ===================================================================================================================================================================
// ------------------------------------------------- PROJECT ZOMBOID COMMANDS ----------------------------------------------------------------------------------------------
// ===================================================================================================================================================================


client.on("chat", function(channel, user, message, self) {
    if (!self) {
      if (user['user-type'] === "mod") {
        return commandFilter(message, channel);
        }
       else {
        return userCommands(message, channel);
      }
  }
});


// ===================================================================================================================================================================
// ------------------------------------------------- RIM WORLD COMMANDS ----------------------------------------------------------------------------------------------
// ===================================================================================================================================================================


client.on("chat", function(channel, user, message, self) {
    if (user['user-type'] === "mod" && message.substring(0, 4) === "!rim" && rim === false) {
        var conditions = validateString(message);
        if (conditions !== false) {
            rim = true;

            // Set the number of minutes left for the caller function
            timeCounter = conditions[1];

            // Start the countdown function
            var timeLimit = setTimeLimit(conditions[1]);
            startTimer(rimArray, conditions[0], timeLimit);

            client.say('mark_exe', "A new colony is being created, there are " + conditions[0] + " spots open, type !queue for a chance to join the rim with Mark! You have " + conditions[1] + " minutes left.");
        } else {
            client.say('mark_exe', "That ain't it bruv, try '!rim (slots) (timelimit/mins)' to get started.");
        }
    }
});


client.on('chat', function(channel, user, message, self) {
    if (message === "!queue" && rim === true) {
        if (rimArray.indexOf(user["display-name"]) === -1) {
            console.log("pushing user");
            rimArray.push(user["display-name"]);
        } else {
            console.log("multiple entries", user["display-name"]);
        }
    }
});

client.on('chat', function(channel, user, message, self) {
    if (message === "!cancel" && rim === true && user['user-type'] === "mod") {
        clearTimeout(timer);
        client.say('mark_exe', "Abandon ship the colony is over!");
        resetGlobals();
    }
});




// ===================================================================================================================================================================
// ------------------------------------------------- FUNCTIONS / TO EXPORT ----------------------------------------------------------------------------------------------
// ===================================================================================================================================================================

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function validateString(string) {

    var thenum = string.match(/\b\d+\b/g);
    if (thenum == null) {
        return false;
    } else {

        // Map the array so that values are not to large for the bot
        thenum = thenum.map(function(x) {
            return ((x > 0 && x < 6) ? parseInt(x) : 5);
        });

        if (thenum.length > 2) {
            console.log("too many numbers, please enter in the command correctly")
            return false;
        } else if (thenum.length === 1) {
            console.log("no timelimit set, adding number to array");
            thenum.push(5);
            return thenum;
        } else if (thenum.length === 2) {
            console.log("All clear, returning thenum")
            return thenum;
        } else {
            console.log("too few numbers, command entered incorrectly");
            return false;
        }
    }
}

function setTimeLimit(number) {
    var getMilliSecs = number * 60000;
    return getMilliSecs;
}

function startTimer(users, spaces, timeLimit) {
    if (timeCounter >= 2) {
        clearInterval(caller);
        caller = setInterval(function() {
            queueCaller(timeCounter, rimArray);
            timeCounter--;
        }, 60000);
    }
    console.log("started");
    clearTimeout(timer);
    timer = setTimeout(function() {
        selectUsers(users, spaces);
    }, timeLimit);
}

function selectUsers(users, spaces) {

    var queuedUsers = users;
    var arrayLength = queuedUsers.length;
    var selectedArray = [];
    var randomNum;

    if (arrayLength === 0) {
        resetGlobals();
        return client.say('mark_exe', "Nobody signed up. Looks like you are flying solo this time Mark!");
    }

    if (spaces > 0) {
        console.log('selecting users loop')
        for (var i = 0; i < spaces; i++) {
            if (queuedUsers.length !== 0) {
                randomNum = getRandomInt(arrayLength - i);
                selectedArray.push(queuedUsers[randomNum]);
                queuedUsers.splice(randomNum, 1);
            } else {
                console.log("queued users less than the spaces, breaking from loop")
                break
            }
        }
    }
    console.log("Returning users");
    console.log(selectedArray, "this is selectedArray");
    resetGlobals();
    return client.say('mark_exe', "Congratulations to " + selectedArray.join(" ") + " let the rimming begin!");
}

function resetGlobals() {
    timeCounter = 0;
    rimArray = [];
    rim = false;
    zomboidChallenge = false;
    suggestionArray = [];
    userArray = [];
    counter = 1;
}

function queueCaller(timeLeft, userArray) {
    var time = parseInt(timeLeft);

    if (timeLeft >= 1) {
        return client.say('mark_exe', "There is " + (time - 1) + " minutes before the rim closes. Type !queue for a chance to be involved. There is currently " + userArray.length + " people waiting to rim.");
    } else {
        clearInterval(caller);
    }
}

// Functions passed from app.js to mark.js

function startFeed() {
    if (job == undefined) {
        job = new CronJob('0 */5 17-23 * * 1', function() {
            Mondoid.getRssFeed(function(zomboid) {
                if (zomboid !== false && zomboid !== true) {
                    var string = "Mondoid Hype, get it while it's hot! " + zomboid.title + " - " + zomboid.link;
                    client.say('mark_exe', string);
                    stopCron();
                } else if (zomboid === true) {
                    stopCron();
                } else {
                    console.log("Mondoid not up");
                }
            });
        }, null, false, 'GMT');
    }
    job.start();
}

// Self invoking function checks if its monday, then runs cron job until mondoid is found.
(function dayCheck() {
    var today = new Date();
    if (today.getDay() == 1) {
        startFeed();
    }
})();

function stopCron() {
    console.log("job stopped");
    job.stop();
}


function sendMessage(data, gameState) {
            compulsionList = [];
            messageCron = new CronJob('*/5 * * * * *', function() {
                compulsionList.push((i + 1) + "). " + data[i]);
                client.say('mark_exe', (i + 1) + "). " + data[i]);
                i++;
                if (i > 4) {
                    setTimeout(function() {
                        client.say('mark_exe', 'That\'s all your compulsions for today, for any clashes type "!reroll <number>"')
                    }, 3000)
                    messageCron.stop();
                    compulsions = false;
                    i = 0;
                }
            }, null, false, 'GMT');
    messageCron.start();
}

function stripArray(message) {
    var thenum = message.match(/\b\d+\b/g);
    console.log(thenum);
    for (var i = 0; i < compulsionList.length; i++) {
        if (thenum[0] === compulsionList[i].substring(0, 1)) {
            console.log("it matches", compulsionList[i])
            compulsionList.splice(i, 1);
            return thenum[0];
        }
    }
    return false;
    console.log("nope it doesnt work");
}

function prepareSuggestions(data) {
    var newArray = []
    for (var i = 0; i < data.length; i++) {
        newArray.push((i + 1) + ") " + data[i]);
    }
    return newArray
}


function commandFilter(message, channel) {

    var string = message.match(/^([!\w\-]+)/g);

    var commands = {
        "!compulsions": function() {
            Compulsion.getCompulsions(5, function(data) {
                return sendMessage(data, false);
            });
        },
        "!reset": function() {
            Compulsion.resetChallenge(function() {
                return client.say(channel, "Compulsions reset");
            })
        },
        "!forfeit": function() {
            Compulsion.getForfeits(1, function(data) {
                return setTimeout(function() {
                    client.say("mark_exe", 'Tut tut, here\'s your forfeit: ' + data);
                    forfeit = false;
                }, 3000);
            })
        },
        "!remaining": function() {
            if (compulsionList.length >= 1) {
                return setTimeout(function() {
                    client.say('mark_exe', compulsionList.join(" "));
                }, 3000);
            } else {
                return setTimeout(function() {
                    client.say('mark_exe', "There are no compulsions left :D ");
                }, 3000);
            }
        },
        "!rules": function() {
            return setTimeout(function() {
                client.say('mark_exe', "The Rules Of Compulsions. #1 - You cannot make Mark waste a lot of time. #2 - No activities with guaranteed death. Very Dangerous is highly recommend though. #3 - Make it good 4Head. #4 - Compulsions cannot overlap(can ignore conflicting compulsion to complete one) but cannot change once started. #5 - Compulsions Start at midnight and end at midnight");
                rules = false;
            }, 5000);
        },
        "!build": function() {
            mBuild = true;
            var data = Mondoid.getBuild();
            client.say("mark_exe", "Marks build. Positives: " + data.pos.join(" "));
            return setTimeout(function() {
                client.say("mark_exe", "Negatives: " + data.neg.join(" "));
                mBuild = false;
            }, 5000);
        },
        "!addforfeit": function() {
            Compulsion.addForfeit(message, function(data) {
                return setTimeout(function() {
                    client.say('mark_exe', "Forfeit added");
                }, 3000);
            })
        },
        "!complete": function() {
            stripArray(message);
            if (compulsionList.length > 0) {
                return setTimeout(function() {
                    client.say('mark_exe', "Good job, only " + compulsionList.length + " left!");
                }, 3000);
            } else {
                return setTimeout(function() {
                    client.say('mark_exe', "All done, get ready for the next tasks after midnight");
                });
            }
        },
        "!reroll": function() {
            var newIndex = stripArray(message);
            if (newIndex === false) {
                client.say('mark_exe', "Sorry that entry doesn't exist, try again. Pssst 1-5 :D")
                return;
            } else {
                Compulsion.getCompulsions(1, function(data) {
                    var string = newIndex + "). " + data
                    compulsionList.splice((newIndex - 1), 0, string);
                    client.say('mark_exe', string);
                });
            }
        },
        "!add": function() {
            Compulsion.addCompulsion(message, function(data) {
                return setTimeout(function() {
                    client.say('mark_exe', "Compulsion added");
                }, 3000);
            });
        },
        "!addquote": function() {
            Mondoid.insertQuote(message, function(string) {
                return client.say('mark_exe', string);
            });
        },
        "!delquote": function() {
            Mondoid.delQuote(message, function(string) {
                console.log(string);
                client.say('mark_exe', string);
            });
        },
        "default": function() {
            return userCommands(message, channel)
        }
    }

    return (commands[string] || commands["default"])();
}

function userCommands(message, channel) {
    var string = message.match(/^([!\w\-]+)/g);

    var commands = {
        "!twitter": function() {
            return client.say('mark_exe', "You can find Marks scholarly musings at https://twitter.com/exe_mark");
        },
        "!mondoid": function() {
            Mondoid.returnMondoid(function(string) {
                return client.say('mark_exe', string);
            });
        },
        "!quote": function() {
            Mondoid.getRandomQuote(function(quote) {
                return client.say('mark_exe', quote);
            });
        },
        "!suggest": function() {
          console.log("suggest running");
            Compulsion.addSuggestion(message, function(data) {
                return setTimeout(function() {
                    client.say('mark_exe', "Suggestion added");
                }, 3000);
            })
        },
        "default": function() {
            return console.log("nothing found");
        }
    }
      if (commands.hasOwnProperty(string) === true) {
          if (checkDelay(channel, string, 5)) {
            cmdTimestamps[channel][string] = new Date().getTime() / 1000;
            return commands[string]();
          }
      } else {
        return commands["default"]();
      }

}


function checkDelay(channel, command, seconds) {
  // Entry doesn't exist, return true.
  if (!cmdTimestamps[channel]) {
      cmdTimestamps[channel] = {};
      return true;
  }
  // Entry exists but the command doesn't, return true.
  if (!cmdTimestamps[channel][command]) {
      return true;
  }

  // Entry exists, check the time difference..
  var currentTime = new Date().getTime() / 1000;
  if (currentTime - cmdTimestamps[channel][command] >= seconds) {
      return true;
  }

  return false;
}
