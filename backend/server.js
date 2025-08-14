import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import GridFsStorage from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
const conn = mongoose.createConnection(MONGO_URI);
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("Connected to MongoDB");
});

// Multer GridFS Storage
const storage = new GridFsStorage({
  url: MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = { filename, bucketName: "uploads" };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

// Mongoose Schema
const recipeSchema = new mongoose.Schema({
  title: String,
  time: String,
  ingredients: [String],
  instructions: String,
  coverImage: String,
  createdBy: String,
  email: String
});

const Recipe = mongoose.model("Recipe", recipeSchema);

// Routes
app.post("/recipe", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, time, ingredients, instructions, email, createdBy } = req.body;
    const recipe = new Recipe({
      title,
      time,
      ingredients: JSON.parse(ingredients),
      instructions,
      coverImage: req.file.filename,
      email,
      createdBy
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/recipe/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    recipe.title = req.body.title || recipe.title;
    recipe.time = req.body.time || recipe.time;
    recipe.ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    if (req.file) recipe.coverImage = req.file.filename;

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/recipe", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/recipe/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve images
app.get("/images/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ message: "Image not found" });
    const readstream = gfs.createReadStream(file.filename);
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
