var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var zomboidSchema = new Schema ({

  title: String,
  link: String,
  date: { type: Date, default: Date.now },
  published: String

});

zomboidSchema.statics.newFunc = function (title, callback) {
  Zomboid.findOne(title, callback);
}

module.exports = mongoose.model("Zomboid", zomboidSchema);
