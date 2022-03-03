const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const User = require("../models/User");

router.get("/user", async (req, res) => {
  res.json("User");
});

router.post("/user/create", async (req, res) => {
  try {
    //récupération du mdp que l'utilisateur a passé
    const password = req.fields.password;
    const salt = uid2(16);
    const hash = SHA256(password + salt).toString(encBase64);
    const token = uid2(16);

    const pictureToUpload = req.files.picture.path;

    if (req.fields.name === "") {
      res.json({
        message: "username is empty",
      });
    } else if (User.email === req.fields.email) {
      res.json({
        message: "Email already exist",
      });
    } else {
      const newUser = new User({
        name: req.fields.name,
        email: req.fields.email,
        password: hash,
        token: token,
        salt: salt,
      });

      await newUser.save();

      newUser.picture = await cloudinary.uploader.upload(pictureToUpload, {
        folder: `Gamepad/Users/${newUser._id}/`,
      });

      await newUser.save();
    }
    res.json({ message: "User created" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const providedMail = req.fields.email;
    const userFromBdd = await User.findOne({ email: providedMail });

    if (userFromBdd) {
      const providedPassword = req.fields.password;
      const hashedUserPassword = SHA256(
        providedPassword + userFromBdd.salt
      ).toString(encBase64);

      if (hashedUserPassword === userFromBdd.password) {
        res.json({
          id: userFromBdd._id,
          token: userFromBdd.token,
        });
      } else {
        res.status(400).json({
          message: "Password is not valid",
        });
      }
    } else {
      res.status(400).json({
        message: "This email not exist",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/update", async (req, res) => {
  try {
    if (req.fields.id) {
      const user = await User.findById(req.fields.id);

      user.name = req.fields.name;
      user.email = req.fields.email;
      //   user.picture = req.fields.picture;

      await user.save();

      res.json(user);
    } else {
      res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/delete", async (req, res) => {
  try {
    if (req.fields.id) {
      await User.findByIdAndDelete(req.fields.id);
      res.json({ message: "User removed" });
    } else {
      res.status(400).json({ message: "Missing ID" });
    }
  } catch (error) {
    res.status(400).json({ error: message.error });
  }
});

module.exports = router;
