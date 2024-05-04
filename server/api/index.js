const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cors = require("cors");
const MongoClient = require('mongodb').MongoClient;

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

const mongoUrl = "mongodb+srv://pgoelbe22:seprojectlogin@login.ijfsgjd.mongodb.net/?retryWrites=true&w=majority&appName=login";
let db;

(async () => {
  try {
    const client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

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
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = { email, password: hashedPassword };
    await db.collection('users').insertOne(newUser);

    return res.status(200).send("Signup successful");
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      console.log("bad email");
      return res.status(400).send("Invalid email or password");
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("bad password");
      return res.status(400).send("Invalid email or password");
    }

    console.log("success");
    return res.status(200).send("Login successful");
  } catch (err) {
    console.log("catch", err);
    return res.status(400).send(err.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;