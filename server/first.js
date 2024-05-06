const express = require("express");
const bodyparser = require("body-parser");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("./conn");
const ejs = require("ejs");
const passport = require("passport");
require("../server/googleauth/googleauthconfig")(passport);
const jwt = require("jsonwebtoken");
const cookieparser = require("cookie-parser");
const user = require("./models/usermodel");
const Grid = require("gridfs-stream");
const usseonline = require("./models/useronlinemodel");
const conversation = require("./models/converstionsmodel");
const message = require("./models/messagemodel");
const upload = require("./controller/multer");

const protected = require("./controller/protected");
// const gfs = require("./controller/getimage");
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieparser());
app.use(bodyparser.json({ extended: true }));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
var connection = mongoose.connection;
let gfs, gridfsBucket;
connection.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: "fs",
  });

  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("fs");

});
app.get("/", protected, (req, res) => {
  // rendering home page
  res.render("index2");
});
app.get("/login", (req, res) => {
  // reder login page
  res.render("login");
});
app.post("/login", async (req, res) => {
  console.log(req.body);
  let newuser = user(req.body);

  var data = await newuser.save();
  console.log(data);
  const token = jwt.sign({ id: data._id }, process.env.SECRET);
  console.log(token);
  var expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  res.cookie("whatsappclone", token, {
    secure: false,
    httponly: false,
    expires: expiryDate,
  });
  res.status(200).json({ id: data._id });
});
app.get("/user/status", protected, async (req, res) => {
  try {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    var data = await user.findOne({ _id: verify.id });
    console.log(data.Status);
    res.send({ success: true, user_status: data.Status });
  } catch (err) {
    throw new Error("could not fetch status");
  }
});
app.post("/user/status", protected, async (req, res) => {
  try {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    var data = await user.findOneAndUpdate(
      { _id: verify.id },
      { Status: req.body.user_status }
    );
    console.log(data);
    res.send({ success: true, msg: "updation succseefully" });
  } catch (err) {
    throw new Error("could not update");
  }
});

app.get("/user/profilepic", protected, async (req, res) => {
  try {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    var data = await user.findOne({ _id: verify.id });
    var profilepicid = data.profilepic;
    res.redirect(`/image/${profilepicid}`);
  } catch (err) {
    throw new Error("could not fetch status");
  }
}); //protected
app.post("/user/profilepic", upload.single("myfile"), async (req, res) => {
  var profilepicid = req.file.id.toString();
  try {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    var data = await user.findOneAndUpdate(
      { _id: verify.id },
      { profilepic: profilepicid }
    );
    res.send({ success: true, msg: "updation succseefully" });
  } catch (err) {
    throw new Error("could not update");
  }
});
app.get("/user/:rid", protected, (req, res) => {
  // dialogue for conversation between two people
  try {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    console.log(req.params.id);
    console.log(req.query.rid);

    res.render("index", (data = { id: verify.id, rid: req.params.rid }));
  } catch (err) {
    throw new Error(err.message);
  }
});

app.get("/get_user_online", protected, async (req, res) => {
  try {
    var data = useronline.find();
    res.send({ success: true, data });
  } catch (err) {
    throw new Error(err.message);
  }
});

app.get("/getmessage/:rid", async (req, res) => {
  //  showing message between two people
  try {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    var data = await message.find({
      senderId: verify.id,
      receiverId: req.params.rid,
    });
    res.send({ success: true, data });
  } catch (err) {
    throw new Error(err.message);
  }
});

app.get("/image/:id", (req, res) => {
  console.log(gfs);

  const readStream = gridfsBucket.openDownloadStream(
    mongoose.Types.ObjectId(req.params.id)
  );
  readStream.pipe(res);
  readStream.on("error", function (err) {
    console.log("An error occurred!", err);
    throw new Error("in sending an immage is not done");
  });
});

app.post(
  "/message/:rid",
  protected,
  upload.single("myfile"),
  async (req, res) => {
    // use to send the message between two people
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(req.cookies.whatsappclone, process.env.SECRET);
    var data = await conversation.findOne({
      members: { $all: [verify.id, req.params.rid] },
    });
    if (!data) {
      var newconversation = conversation({
        members: [verify.id, req.params.rid],
      });
      data = await newconversation.save();
    }
    var message1;
    if (req.file) {
      console.log(req.file);
      var newmessage = message({
        conversationId: data._id,
        senderId: verify.id,
        receiverId: req.params.rid,
        text: "media",
        type: req.file.contentType,
        fileid: req.file.id,
      });
      var message1 = await newmessage.save();
      console.log(message1);
    } else {
      var newmessage = message({
        conversationId: data._id,
        senderId: verify.id,
        receiverId: req.params.rid,
        text: req.body.text,
        type: "text",
      });
      var message1 = await newmessage.save();
      console.log(message1);
    }
    await conversation.findByIdAndUpdate(data._id, {
      message: message1.text,
    });
    res.status(200).send("<h1>message_send</h1>");
  }
);
app.get("/logout", (req, res) => {
  res.clearCookie("whatsappclone");
  // home page
});

app.use((err, req, res, next) => {
  if (err) {
    console.log(err.message);
    console.log(err.stack);
    res.status(200).send({ success: false, msg: "some error occured" });
  } else {
    res.status(200).send({ success: false, msg: "not a valid url" });
  }
});

console.log(process.env.SECRET);
app.listen(process.env.PORT, (err) => {
  if (!err) console.log("port is runnining...");
});
// getting token
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
// reterive user data using token
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    console.log(req.user);
    const token = jwt.sign({ id: req.user._id }, process.env.SECRET);
    console.log(token);
    var expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    res.cookie("whatsappclone", token, {
      secure: false,
      httponly: false,
      expires: expiryDate,
    });
    res.status(200).json({ id: req.user._id });
    res.redirect("/profile/");
  }
);

app.get("/profile", (req, res) => {
  res.send("Welcome");
});
app.get("/auth", (req, res) => {
  res.render("googleauth");
});
