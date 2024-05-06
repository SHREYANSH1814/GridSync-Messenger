const mongoose = require("mongoose");
var useronlineschema = mongoose.Schema(
  {
    userid: {
      type: String,
      unique: true,
    },
    socketid: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const useronlinemodel = mongoose.model("useronline", useronlineschema);
module.exports = useronlinemodel;
