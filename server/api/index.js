const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

const app = express();

// Enable CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));





// Enable CORS for all origins
app.use(cors());

// Set Access-Control-Allow-Origin for all routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});







// // Set Access-Control-Allow-Origin for all routes
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
//   next();
// });

// Parse request bodies
app.use(express.json());

// Custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong.");
});

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://pgoelbe22:projectlogin@login.ijfsgjd.mongodb.net/?retryWrites=true&w=majority&appName=login",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Define user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create user model
const User = mongoose.model("User", userSchema);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// Routes
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ email, password: hashedPassword });
    await user.save();
    return res.status(200).send("Signup successful");
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).send("Invalid email or password");
    }

    return res.status(200).send("Login successful");
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;