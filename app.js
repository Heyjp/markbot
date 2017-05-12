require('dotenv').config();
var tmi = require('tmi.js');
var mongoose = require('mongoose');
var config = require('./config/db');
require('./commands/mark');

mongoose.connect(config.url);
