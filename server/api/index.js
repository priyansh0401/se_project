const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/login-signup-app');

// Create a Mongoose model for users
const UserSchema = new mongoose.Schema({
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

const User = mongoose.model('User', UserSchema);

// Create an Express server
app.use(bodyParser.json());
app.use(session({
  secret: 'my secret key',
  resave: false,
  saveUninitialized: true
}));

// Create a route for the login form
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

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
});

// Create a route for the signup form
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const user = new User({
    email,
    password: await bcrypt.hash(password, 10)
  });

  await user.save();

  req.session.user = user;

  res.send('Signed up successfully');
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});