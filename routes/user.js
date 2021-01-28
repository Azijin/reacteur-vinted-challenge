// express server routes
const express = require("express");
const router = express.Router();

//package for the password
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

//package for upload images
const cloudinary = require("cloudinary").v2;
//set the config with information from cloudinary account
cloudinary.config({
  cloud_name: "azijin",
  api_key: "843235519668172",
  api_secret: "53X0qcdwWcUkSdCj-All1vBnPL8",
});
// document model for the user
const User = require("../models/User");
const Offer = require("../models/Offer");

//ROUTE SIGNUP
router.post("/vinted/user/signup", async (req, res) => {
  try {
    const { email, username, password } = req.fields;
    if (email) {
      const searchUserByEmail = await User.findOne({ email: email });
      const searchUserByUsername = await User.findOne({
        "account.username": username,
      });
      if (searchUserByEmail) {
        res.status(409).json({
          error: { message: "A profil is already registered with this email" },
        });
      } else if (searchUserByUsername) {
        res.status(409).json({
          error: {
            message: `A profil is already registered with this username`,
          },
        });
      } else {
        if (username && password) {
          const salt = uid2(64);
          const hash = SHA256(password + salt).toString(encBase64);
          const token = uid2(64);
          const newUser = new User({
            email: email,
            account: {
              username: username,
            },
            token: token,
            hash: hash,
            salt: salt,
          });
          await newUser.save();
          res.status(200).json({
            message: "Your account has been created",
            _id: newUser._id,
            token: newUser.token,
          });
        } else {
          res.status(400).json({ error: { message: "Missing username" } });
        }
      }
    } else {
      res.status(400).json({ error: { message: "Missing email" } });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//ROUTE LOGIN
router.post("/vinted/user/login", async (req, res) => {
  try {
    const regex = /@/g;
    const login = req.fields.login;
    const loginToSearch = regex.test(login)
      ? { email: login }
      : {
          "account.username": login,
        };
    const user = await User.findOne(loginToSearch);
    if (user) {
      const hash = SHA256(req.fields.password + user.salt).toString(encBase64);
      if (user.hash === hash) {
        res.status(200).json({
          message: "you are logged",
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(400).json({ error: { message: "Unauthorised" } });
      }
    } else {
      res
        .status(404)
        .json({
          error: { message: "No mail or username associated to an account" },
        });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
