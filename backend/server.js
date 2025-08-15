import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://food-recipe-c4k1vqkg3-shlok-mehtas-projects-18532258.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

const PORT = process.env.PORT || 10000;
const MONGO_URI = process.env.MONGO_URI;

// Mongoose settings
mongoose.set("strictQuery", false);

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 30000, // 30s
    socketTimeoutMS: 45000   // 45s
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const conn = mongoose.connection;

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  console.log("✅ GridFS initialized");
});

// Multer GridFS Storage
const storage = new GridFsStorage({
  url: MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        resolve({ filename, bucketName: "uploads" });
      });
    });
  }
});

const upload = multer({ storage });

// Schema
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

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("🍲 Food Recipe API is running");
});

// Create Recipe
app.post("/recipe", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, time, ingredients, instructions, email, createdBy } = req.body;

    const recipe = new Recipe({
      title,
      time,
      ingredients:
        typeof ingredients === "string"
          ? JSON.parse(ingredients)
          : ingredients,
      instructions,
      coverImage: req.file?.filename || null,
      email,
      createdBy
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Recipe
app.put("/recipe/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    recipe.title = req.body.title || recipe.title;
    recipe.time = req.body.time || recipe.time;
    recipe.ingredients = req.body.ingredients
      ? typeof req.body.ingredients === "string"
        ? JSON.parse(req.body.ingredients)
        : req.body.ingredients
      : recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;
    if (req.file) recipe.coverImage = req.file.filename;

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all recipes
app.get("/recipe", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single recipe
app.get("/recipe/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve images from GridFS
app.get("/images/:filename", async (req, res) => {
  if (!gfs) {
    return res.status(500).json({ message: "File storage not initialized" });
  }

  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ message: "Image not found" });

    if (!file.contentType.startsWith("image/")) {
      return res.status(400).json({ message: "Not an image file" });
    }

    const readstream = gfs.createReadStream({ filename: file.filename });
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
