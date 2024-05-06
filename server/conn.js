const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/whatsappclone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose;
