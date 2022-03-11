const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const rawgGet = require("../rawg-get");

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
      res.json({
        id: newUser._id,
        token: newUser.token,
        name: newUser.name,
        picture: newUser.picture.url,
      });
    }
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
          name: userFromBdd.name,
          picture: userFromBdd.picture.url,
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

router.post("/addToMyCollection", async (req, res) => {
  try {
    //je regarde si on me fournis l'id du jeu et le token de l'utilisateur
    const gameId = req.fields.gameId;
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    if (gameId && user) {
      //si l'utilisateur est connecter et qu'on me passe en paramètre une collection
      const oldCollection = user.myCollection || [];
      if (!oldCollection.includes(gameId)) {
        user.myCollection = [...oldCollection, gameId];
        await user.save();
        res.json("Game add to your collection");
      } else {
        res.status(400).json("Game already in your collection");
      }
    } else {
      res.json({ message: "Give a game Id" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/myCollection", async (req, res) => {
  try {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    const collection = user.myCollection;
    const games = [];
    for (const gameId of collection) {
      const response = await rawgGet(`/games/${gameId}`);
      games.push(response.data);
    }

    res.json(games);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/deleteToMyCollection", async (req, res) => {
  try {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    if (user) {
      user.myCollection = user.myCollection.filter(
        (gameId) => gameId !== req.fields.id
      );
      await user.save();

      res.json({ message: "Game removed from your collection" });
    } else {
      res.status(401).json();
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
