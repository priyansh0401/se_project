const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();
// Enable CORS
app.use(cors());
// Parse request bodies
app.use(express.json());

// Load environment variables
dotenv.config({ path: ".env.local" });

// MongoDB connection
const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  if (!client.isConnected()) await client.connect();
  return client.db();
}

async function disconnect() {
  if (client.isConnected()) await client.close();
}

// Custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong.");
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Users routes
const usersRouter = express.Router();

usersRouter.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const db = await connect();
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = { email, password: hashedPassword };
    await db.collection("users").insertOne(user);

    return res.status(200).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

usersRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const db = await connect();
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/users", usersRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  await disconnect();
  process.exit(0);
});