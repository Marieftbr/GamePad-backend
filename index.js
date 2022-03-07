const axios = require("axios");
const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
mongoose.connect(process.env.MONGODB_URL || "mongodb://127.0.0.1/gamepad");

const app = express();
app.use(formidable());

app.use(cors());

const userRoutes = require("./routes/user");
const rawgGet = require("./rawg-get");
app.use(userRoutes);

app.get("/games", async (req, res) => {
  try {
    const rawgResponse = await rawgGet("/games", req.query);

    const response = {
      total: rawgResponse.data.count,
      games: rawgResponse.data.results,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/game/:id", async (req, res) => {
  try {
    const rawgResponse = await rawgGet(`/games/${req.params.id}`, req.query);

    const response = {
      game: rawgResponse.data,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/platforms", async (req, res) => {
  try {
    const rawgResponse = await rawgGet("/platforms", req.query);

    const response = {
      platforms: rawgResponse.data.results.map((platform) => {
        return { id: platform.id, name: platform.name };
      }),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/genres", async (req, res) => {
  try {
    const rawgResponse = await rawgGet("/genres", req.query);

    console.log(rawgResponse.data);

    const response = {
      genres: rawgResponse.data.results.map((genre) => {
        return { id: genre.id, name: genre.name };
      }),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Server has started");
});
