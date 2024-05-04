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
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  if (!client.isConnected()) await client.connect();
  return client.db();
}

async function disconnect() {
  if (client.isConnected()) await client.close();
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const usersRouter = express.Router();

usersRouter.post("/signup", async (req, res) => {
  // ... (same as before)
});

usersRouter.post("/login", async (req, res) => {
  // ... (same as before)
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