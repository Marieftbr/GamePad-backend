const Review = require("../models/Review");
const User = require("../models/User");
const express = require("express");
const router = express.Router();

//READ REVIEW
router.get("/reviews/:gameId", async (req, res) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId }).populate(
      "user"
    );

    res.json(
      reviews.map((review) => {
        return {
          _id: review._id,
          title: review.title,
          comment: review.comment,
          createdAt: review.createdAt,
          gameId: review.gameId,
          user: {
            name: review.user.name,
            picture_url: review.user.picture.url,
          },
        };
      })
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//CREATE REVIEW
router.post("/review/create", async (req, res) => {
  try {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    const reviews = await Review.find({
      gameId: req.fields.gameId,
      user: user._id,
    });

    if (req.fields.title === "" || req.fields.comment === "") {
      res.json({
        message: "entry is empty",
      });
    } else if (reviews.length) {
      res.json({ message: "you already leave a comment for this game" });
    } else {
      const newReview = new Review({
        title: req.fields.title,
        comment: req.fields.comment,
        gameId: req.fields.gameId,
        user: user,
      });

      await newReview.save();

      res.json({
        _id: newReview._id,
        title: newReview.title,
        comment: newReview.comment,
        createdAt: newReview.createdAt,
        gameId: newReview.gameId,
        user: {
          name: user.name,
          picture_url: user.picture.url,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
