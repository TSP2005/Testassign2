const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  validateRequest
];

const loginValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest
];

const createPlanValidation = [
  body('name').notEmpty().withMessage('Plan name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  validateRequest
];

const createSubscriptionValidation = [
  body('planId')
    .isInt({ min: 1 })
    .withMessage('Valid plan ID is required'),
  validateRequest
];

const userIdValidation = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  validateRequest
];

module.exports = {
  registerValidation,
  loginValidation,
  createPlanValidation,
  createSubscriptionValidation,
  userIdValidation
};