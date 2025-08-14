const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const connectDb = require("./config/connectionDb");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

// Connect to DB
connectDb();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://food-recipe-6lcgkgatm-shlok-mehtas-projects-18532258.vercel.app" // Vercel frontend
];

// Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/", require("./routes/user"));
app.use("/recipe", require("./routes/recipe"));

// Start server
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
