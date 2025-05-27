const {
    createSubscription: createNewSubscription,
    getSubscription: fetchSubscription,
    updateSubscription: modifySubscription,
    cancelSubscription: removeSubscription,
  } = require('../services/subscriptionService');
  
  async function createSubscription(req, res) {
    try {
      const { planId } = req.body;
      const userId = req.userId;
      const subscription = await createNewSubscription(userId, planId);
      res.status(201).json(subscription);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  
  async function getSubscription(req, res) {
    try {
      const { userId } = req.params;
      if (parseInt(userId) !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const subscription = await fetchSubscription(userId);
      res.json(subscription);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  
  async function updateSubscription(req, res) {
    try {
      const { userId } = req.params;
      const { planId } = req.body;
      if (parseInt(userId) !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const subscription = await modifySubscription(userId, planId);
      res.json(subscription);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  
  async function cancelSubscription(req, res) {
    try {
      const { userId } = req.params;
      if (parseInt(userId) !== req.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const result = await removeSubscription(userId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
  
  module.exports = {
    createSubscription,
    getSubscription,
    updateSubscription,
    cancelSubscription,
  };