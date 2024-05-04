const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { MongoClient } = require("mongodb");
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

const mongoUrl = "mongodb+srv://pgoelbe22:seprojectlogin@login.ijfsgjd.mongodb.net/?retryWrites=true&w=majority&appName=login";
const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

(async () => {
  try {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");

    const usersCollection = db.collection("users");

    const port = process.env.PORT || 3000;

    // Start the server only after successful MongoDB connection
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
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
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).send("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const result = await usersCollection.insertOne({ email, password: hashedPassword });
        return res.status(200).send("Signup successful");
      } catch (err) {
        return res.status(400).send(err);
      }
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        // Find user by email
        const user = await usersCollection.findOne({ email });
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
        return res.status(400).send(err);
      }
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();

// Global exception handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // You can also log the error to a logging service or handle it differently
});

module.exports = app;