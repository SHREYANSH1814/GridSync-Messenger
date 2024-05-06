const express = require("express");
const getcid = require("../controller/conversation");
const user = require("../models/usermodel");
const router = express.Router();

router.post("/add", async (req, res) => {
  const newuser = user(req.body);
  await newuser.save();
  var data = await user.find({ email: req.body.email });
});

router.post("/send_message/:id", authorised, async (req, res) => {
  const token = req.cookies.whatsappclone;
  const verify = jwt.verify(token, "hishreyansh");
  const senderID = verify.id;
  const receiverID = req.params.id;
  // conversation id
  var msg = "";
  let cid = await getcid(senderID, receiverID, msg);
  res.json({ success: true, msg: "sent successfully" });
});
