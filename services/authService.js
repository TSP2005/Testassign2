const User = require('../models/user');
const jwt = require('jsonwebtoken');

async function register(name, email, password) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password
  });

  const token = generateToken(user.id);
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id);
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
}

module.exports = {
  register,
  login
};