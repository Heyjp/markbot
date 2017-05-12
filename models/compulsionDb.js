var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var compulsionSchema = {
  compulsion: [String],
  forfeits: [String],
  suggestions: [String]
}

module.exports = mongoose.model('Compulsion', compulsionSchema);
