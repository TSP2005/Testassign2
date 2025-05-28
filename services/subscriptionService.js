const Subscription = require('../models/subscription');
const Plan = require('../models/plan');
const { addDays } = require('date-fns');
const redis = require('../config/redis');
const { withRetry } = require('../utils/retry');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { Transaction } = require('sequelize');
const sequelize = require('../config/database');

async function createSubscription(userId, planId) {
  return withRetry(async () => {
    const transaction = await sequelize.transaction();
    
    try {
      const existing = await Subscription.findOne({
        where: { userId, status: 'ACTIVE' },
        transaction
      });
      
      if (existing) {
        throw new ValidationError('User already has an active subscription');
      }

      const plan = await Plan.findByPk(planId, { transaction });
      if (!plan) {
        throw new NotFoundError('Plan not found');
      }

      const startDate = new Date();
      const endDate = addDays(startDate, plan.duration);

      const subscription = await Subscription.create({
        userId,
        planId,
        startDate,
        endDate,
        status: 'ACTIVE',
      }, { transaction });

      await redis.zAdd('expiration_queue', {
        score: endDate.getTime(),
        value: subscription.id.toString()
      });

      await transaction.commit();
      return subscription;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });
}

async function getSubscription(userId) {
  return withRetry(async () => {
    const subscription = await Subscription.findOne({
      where: { userId, status: 'ACTIVE' },
      include: Plan,
    });
    
    if (!subscription) {
      throw new NotFoundError('No active subscription found');
    }
    
    return subscription;
  });
}

async function updateSubscription(userId, planId) {
  return withRetry(async () => {
    const transaction = await sequelize.transaction();
    
    try {
      const subscription = await Subscription.findOne({
        where: { userId, status: 'ACTIVE' },
        transaction,
      });

      if (!subscription) {
        throw new NotFoundError('No active subscription found');
      }

      const plan = await Plan.findByPk(planId, { transaction });
      if (!plan) {
        throw new NotFoundError('Plan not found');
      }

      const endDate = addDays(subscription.startDate, plan.duration);
      
      // Update Redis expiration queue
      await redis.zRem('expiration_queue', subscription.id.toString());
      await redis.zAdd('expiration_queue', {
        score: endDate.getTime(),
        value: subscription.id.toString()
      });

      subscription.planId = planId;
      subscription.endDate = endDate;
      await subscription.save({ transaction });

      await transaction.commit();
      return subscription;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });
}

async function cancelSubscription(userId) {
  return withRetry(async () => {
    const transaction = await sequelize.transaction();
    
    try {
      const subscription = await Subscription.findOne({
        where: { userId, status: 'ACTIVE' },
        transaction,
      });

      if (!subscription) {
        throw new NotFoundError('No active subscription found');
      }

      subscription.status = 'CANCELLED';
      await subscription.save({ transaction });

      // Remove from Redis expiration queue
      await redis.zRem('expiration_queue', subscription.id.toString());

      await transaction.commit();
      return { message: 'Subscription cancelled successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  });
}

module.exports = {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
};