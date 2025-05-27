const { AppError } = require('../middleware/errorHandler');
const { Transaction } = require('sequelize');
const sequelize = require('../config/database');

async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's a validation error or not found error
      if (error.statusCode === 400 || error.statusCode === 404) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
        continue;
      }
    }
  }
  
  throw new AppError(`Operation failed after ${maxRetries} retries: ${lastError.message}`, 500);
}

async function withTransaction(operation) {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED
  });

  try {
    const result = await operation(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { withRetry, withTransaction };