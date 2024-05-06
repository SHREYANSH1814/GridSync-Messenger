const mongoose = require("mongoose");
const grid = require("gridfs-stream");
let gfs;
const conn = mongoose.connection;
conn.once("open", () => {
  gfs = grid(conn.db, mongoose.mongo);
  gfs.collection("fs");
});
module.exports = gfs;
