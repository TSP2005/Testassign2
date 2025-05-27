const { register, login } = require('../services/authService');

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const result = await register(name, email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

module.exports = {
  registerUser,
  loginUser
};