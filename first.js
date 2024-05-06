const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const conn = require("../server/conn");

const useronline = require("../server/models/useronlinemodel");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const getsocketid = async (userid, socketid) => {
  try {
    data = await useronline.findOneAndUpdate(
      { userid: userid },
      { socketid: socketid }
    );
    if (!data) {
      var newuser = useronline({ userid, socketid });
      data = await newuser.save();
    }
  } catch (err) {
    throw new Error("can not get user");
  }
};

io.on("connection", (socket) => {
  socket.on("storeuser", (data) => {
    console.log(socket.id);
    console.log(data.userid);
    getsocketid(data.userid, socket.id)
      .then(() => {
        console.log("user added successfully");
      })
      .catch((err) => {
        console.log(err.message);
      });
  });

  socket.on("get_message", async (data) => {
    const rid = data.receiverid;
    var data2 = await useronline.findOne({ socketid: socket.id });
    var data1 = await useronline.findOne({ userid: rid });
    if (!data1) {
      console.log("user doesnot exit");
    } else {
      if (data1.socketid == "undefined") {
        console.log("user is not active");
      } else {
        data.receiverid = undefined;
        data.senderid = data2.userid;
        console.log(data);
        console.log(data1.socketid);

        socket.to(data1.socketid).emit("message", data);
      }
    }
  });
  socket.on("media_upload", async (data) => {
    const rid = data.receiverid;
    var data2 = await useronline.findOne({ socketid: socket.id });
    var data1 = await useronline.findOne({ userid: rid });
    if (!data1) {
      console.log("user doesnot exit");
    } else {
      if (data1.socketid == "undefined") {
        console.log("user is not active");
      } else {
        data.receiverid = undefined;
        data.senderid = data2.userid;
        console.log(data);
        console.log(data1.socketid);

        socket.to(data1.socketid).emit("media_received", data);
      }
    }
  });

  socket.on("disconnect", async () => {
    await useronline.findOneAndUpdate(
      { socketid: socket.id },
      { socketid: "undefined" }
    );
    console.log("connection banned");
  });
});

httpServer.listen(5000);
