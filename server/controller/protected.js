const express = require("express");
const jwt = require("jsonwebtoken");
const protected = (req, res, next) => {
  if (req.cookies.whatsappclone) {
    const token = req.cookies.whatsappclone;
    const verify = jwt.verify(token, process.env.SECRET);
    if (verify) {
      next();
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
};
module.exports = protected;
