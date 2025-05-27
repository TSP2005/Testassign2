const { getPlans } = require('../services/planService');
const Plan = require('../models/plan');

async function getAllPlans(req, res) {
  try {
    const plans = await getPlans();
    res.json(plans);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function createPlan(req, res) {
  try {
    const { name, price, features, duration } = req.body;
    const plan = await Plan.create({
      name,
      price,
      features,
      duration
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getAllPlans, createPlan };