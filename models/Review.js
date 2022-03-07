const mongoose = require("mongoose");

const Review = mongoose.model(
  "Review",
  new mongoose.Schema(
    {
      title: { type: String },
      comment: { type: String },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      gameId: { type: Number },
    },
    { timestamps: true }
  )
);

module.exports = Review;
