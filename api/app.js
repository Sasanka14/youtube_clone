const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const userRoute = require("./routes/User");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const connectWithDatabase = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database successfully!");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
};

connectWithDatabase();

app.use(bodyParser.json());
app.use(fileUpload(
    {
        useTempFiles: true,
       //  tempFileDir: "/tmp/"
    }
));

app.use("/user", userRoute);

module.exports = app;
