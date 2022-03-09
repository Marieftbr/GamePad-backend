const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: { type: String },
  email: { type: String },
  password: { type: String },
  picture: { type: mongoose.Schema.Types.Mixed, default: {} },
  token: { type: String },
  hash: { type: String },
  salt: { type: String },
  myCollection: [Number],
});

module.exports = User;
