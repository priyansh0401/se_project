const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cors = require("cors");
// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

const app = express();
// Enable CORS
app.use(cors());
// Parse request bodies
app.use(express.json());
// Custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong.");
});
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// User model
const users = { email: [""] };
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const domain = "se-project-server.vercel.app";
  res.send(`Express on bnb ${domain}`);
});

// Routes
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    if (users[email]) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    users[email] = { email, password: password };

    // Store user in Redis
    // redisClient.set(email, JSON.stringify(users[email]));

    return res.status(200).send("Signup successful");
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    if (!users[email]) {
      console.log("bad email");
      return res.status(400).send("Invalid email or password");
    }

    // Compare password
    const validPassword = password == users[email].password;
    if (!validPassword) {
      console.log("bad password");
      return res.status(400).send("Invalid email or password");
    }

    console.log("success");
    return res.status(200).send("Login successful");
  } catch (err) {
    console.log("catch", err);
    return res.status(400).send(err);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
