const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
      unique: true,
    },
    phone: String,
    avatar: { type: mongoose.Schema.Types.Mixed, default: {} },
    country: String,
    city: String,
  },
  token: String,
  hash: String,
  salt: String,
});
module.exports = User;
