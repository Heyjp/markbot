var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quoteSchema = {
  quote: [String]
}

module.exports = mongoose.model('Quote', quoteSchema);
