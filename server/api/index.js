const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;

// Load environment variables from.env.local file
// dotenv.config({ path: ".env.local" });

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

const port = process.env.PORT || 3000;

// MongoDB connection
const mongoUrl = "mongodb+srv://pgoelbe22:#@1$Apple@moneymindslogin.0ng72cs.mongodb.net/?retryWrites=true&w=majority&appName=moneymindslogin";
const dbName = "moneymindslogin";
let db;

MongoClient.connect(mongoUrl, (err, client) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  db = client.db(dbName);
  console.log(`Connected to MongoDB database: ${dbName}`);
});

app.get("/", (req, res) => {
  const domain = "se-project-server.vercel.app";
  res.send(`Express on bnb ${domain}`);
});

// Routes
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const user = await db.collection("users").findOne({ email });
    if (user) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = { email, password: hashedPassword };
    await db.collection("users").insertOne(newUser);

    return res.status(200).send("Signup successful");
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await db.collection("users").findOne({ email });
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