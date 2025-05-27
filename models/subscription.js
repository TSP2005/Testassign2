const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Plan = require('./plan');

const Subscription = sequelize.define('Subscription', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },
});

Subscription.belongsTo(Plan, { foreignKey: 'planId' });

module.exports = Subscription;