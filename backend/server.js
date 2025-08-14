const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const connectDb = require("./config/connectionDb");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

// Connect to DB
connectDb();

// CORS Allowed Origins
const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,  // Any localhost port (React, Vite, etc.)
  /^https:\/\/.*\.vercel\.app$/, // Any Vercel deployment
  /^https:\/\/.*\.netlify\.app$/ // Any Netlify deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow server-to-server calls

      if (allowedOrigins.some(pattern => pattern.test(origin))) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
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

app.listen(PORT, () => {
  console.log(`✅ App is listening on port ${PORT}`);
});
