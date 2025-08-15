import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";

// Import route files
import userRoutes from "./routes/user.js";
import recipeRoutes from "./routes/recipe.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.endsWith(".vercel.app") || origin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000
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

// Root route for health check
app.get("/", (req, res) => {
  res.send("🍲 Food Recipe API is running");
});

// ----------------- INLINE RECIPE ROUTES (unchanged) -----------------

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

// ----------------- ROUTE FILE MOUNTING (NEW) -----------------
app.use("/api/user", userRoutes);      // mounts /signUp, /login, /user/:id
app.use("/api/recipe", recipeRoutes);  // mounts controller-based recipe routes
// ---------------------------------------------------------------

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
