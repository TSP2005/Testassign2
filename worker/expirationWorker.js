const redis = require('../config/redis');
const Subscription = require('../models/subscription');

async function processExpiredSubscriptions() {
  const now = Date.now();
  const expired = await redis.zRange('expiration_queue', 0, now, {
    BYSTORE: true
  });
  
  for (const subscriptionId of expired) {
    await Subscription.update(
      { status: 'EXPIRED' },
      { where: { id: subscriptionId, status: 'ACTIVE' } }
    );
    await redis.zRem('expiration_queue', subscriptionId);
  }
}

setInterval(processExpiredSubscriptions, 60 * 1000); // Run every minute