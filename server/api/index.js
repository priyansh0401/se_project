const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://priyansh0401:projectlogin@login.rqsthm7.mongodb.net/?retryWrites=true&w=majority&appName=login', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a Mongoose model for users
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

// Create an Express server
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Create a route for the login form
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email ||!password) {
      return res.status(400).send('Email and password are required');
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }

    req.session.user = user;

    res.send('Logged in successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Create a route for the signup form
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email ||!password) {
      return res.status(400).send('Email and password are required');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send('Email already exists');
    }

    const user = new User({
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();

    req.session.user = user;

    res.send('Signed up successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error signing up');
  }
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});