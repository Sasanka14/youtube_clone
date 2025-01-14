const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const Users = require("../models/Users");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//  Signup configuration
Router.post("/signup", async (req, res) => {
  try {
    const existingUser = await Users.find({ email: req.body.email });
    if (existingUser.length > 0) {
      return res.status(500).json({
        error: "User already exists",
      });
    }

    const hashCode = await bcrypt.hash(req.body.password, 10);
    const uploadedImage = await cloudinary.uploader.upload(
      req.files.logo.tempFilePath
    );
    const newUser = new Users({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashCode,
      logoUrl: uploadedImage.secure_url,
      logoId: uploadedImage.public_id,
    });
    const user = await newUser.save();
    res.status(200).json({
      newUser: user,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      error: "Internal server error",
    });
  }
});

//  Login configuration

Router.post("/login", async (req, res) => {
  try {
    const user = await Users.find({email:req.body.email});
    if (!user.length > 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user[0].password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    const token = jwt.sign({ 
        _id: user[0]._id,
        channelName: user[0].channelName,
        email: user[0].email,
        phone: user[0].phone,
        logoId: user[0].logoId,
        logoUrl: user[0].logoUrl,
        subscribers: user[0].subscribers,
        subscribedChannels: user[0].subscribedChannels,
     }, 
     process.env.JWT_SECRET, 
     {expiresIn: "365d", });
     
     res.status(200).json({
        _id: user[0]._id,
        channelName: user[0].channelName,
        email: user[0].email,
        phone: user[0].phone,
        logoId: user[0].logoId,
        logoUrl: user[0].logoUrl,
        subscribers: user[0].subscribers,
        subscribedChannels: user[0].subscribedChannels,
        token: token,
     });
  } 
  catch (err) {
    res.status(500).json({
      error: err.message,
      error: "Something is wrong",
    });
  }
});

module.exports = Router;
