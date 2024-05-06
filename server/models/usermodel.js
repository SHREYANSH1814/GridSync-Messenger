const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  emailid: {
    type: String,
    unique: true,
  },
  username: String,

  profilepic: String,
  Status: String,
});

const user = mongoose.model("user", userSchema);

module.exports = user;
