const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const app = express();

// Enable CORS with specific allowed origins and credentials
const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  try {
    if (!client.isConnected()) {
      await client.connect();
    }
    return client.db();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

async function disconnect() {
  try {
    if (client.isConnected()) {
      await client.close();
    }
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const usersRouter = express.Router();

usersRouter.post("/signup", async (req, res) => {
  try {
    const db = await connect();
    const usersCollection = db.collection("users");
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    const result = await usersCollection.insertOne(user);
    res.status(201).send(`User created with id ${result.insertedId}`);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).send("Error creating user");
  }
});

usersRouter.post("/login", async (req, res) => {
  try {
    const db = await connect();
    const usersCollection = db.collection("users");
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    if (!user) {
      res.status(401).send("Invalid username or password");
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).send("Invalid username or password");
      return;
    }
    res.send(`Logged in as ${username}`);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});

app.use("/api/users", usersRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("SIGINT", async () => {
  try {
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    process.exit(1);
  }
});