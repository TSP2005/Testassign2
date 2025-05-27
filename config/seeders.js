const Plan = require('../models/plan');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    // Create default plans
    const plans = [
      {
        name: 'Basic Plan',
        price: 9.99,
        features: ['Basic Support', '1 User', 'Basic Features'],
        duration: 30
      },
      {
        name: 'Professional Plan',
        price: 19.99,
        features: ['Priority Support', '5 Users', 'Advanced Features'],
        duration: 30
      },
      {
        name: 'Enterprise Plan',
        price: 49.99,
        features: ['24/7 Support', 'Unlimited Users', 'Premium Features'],
        duration: 30
      }
    ];

    // Create test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    for (const plan of plans) {
      await Plan.findOrCreate({
        where: { name: plan.name },
        defaults: plan
      });
    }

    await User.findOrCreate({
      where: { email: testUser.email },
      defaults: testUser
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase;