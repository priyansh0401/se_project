const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/myDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// Middleware
app.use(express.json());

// Routes
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  // Validate request
  if (!username || !email || !password) {
    return res.status(400).send({
      message: "All fields are required",
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).send({
      message: "User already exists",
    });
  }

  // Hash the password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  // Create a new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  // Save the user to the database
  await newUser.save();

  // Generate a JWT token
  const token = jwt.sign({ id: newUser._id }, "secretKey", {
    expiresIn: "1h",
  });

  // Send the token in the response
  res.status(200).send({
    message: "User created successfully",
    token,
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).send({
      message: "All fields are required",
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({
      message: "User not found",
    });
  }

  // Compare the provided password with the stored hash
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send({
      message: "Invalid password",
    });
  }

  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, "secretKey", {
    expiresIn: "1h",
  });

  // Send the token in the response
  res.status(200).send({
    message: "User logged in successfully",
    token,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});