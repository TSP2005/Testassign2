const jwt = require('jsonwebtoken');
const Plan = require('../models/plan');

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

async function getPlans() {
  try {
    const plans = await Plan.findAll();
    return plans;
  } catch (err) {
    throw new Error('Failed to fetch plans');
  }
}

module.exports = {
  authMiddleware,
  getPlans
};