const express = require('express');
const router = express.Router();
const { getAllPlans, createPlan } = require('./controllers/planController');
const { registerUser, loginUser } = require('./controllers/authController');
const {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
} = require('./controllers/subscriptionController');
const authMiddleware = require('./middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Plan ID
 *         name:
 *           type: string
 *           description: Plan name
 *         price:
 *           type: number
 *           description: Plan price
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: List of plan features
 *         duration:
 *           type: integer
 *           description: Duration in days
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Subscription ID
 *         userId:
 *           type: integer
 *           description: User ID
 *         planId:
 *           type: integer
 *           description: Plan ID
 *         status:
 *           type: string
 *           enum: [ACTIVE, EXPIRED, CANCELLED]
 *           description: Subscription status
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication endpoints
 *   - name: Plans
 *     description: Subscription plan management
 *   - name: Subscriptions
 *     description: User subscription management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Invalid request or email already exists
 */
router.post('/auth/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       401:
 *         description: Invalid credentials
 */
router.post('/auth/login', loginUser);

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: List of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *                 description: Plan name
 *               price:
 *                 type: number
 *                 description: Plan price
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of plan features
 *               duration:
 *                 type: integer
 *                 description: Duration in days
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request data
 */
router.get('/plans', getAllPlans);
router.post('/plans', authMiddleware, createPlan);

/**
 * @swagger
 * /subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: ID of the plan to subscribe to
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request or plan not found
 */
router.post('/subscriptions', authMiddleware, createSubscription);

/**
 * @swagger
 * /subscriptions/{userId}:
 *   get:
 *     summary: Get user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose subscription to retrieve
 *     responses:
 *       200:
 *         description: User's subscription details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot access other user's subscription
 *       404:
 *         description: Subscription not found
 *   put:
 *     summary: Update user's subscription plan
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose subscription to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: ID of the new plan
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot modify other user's subscription
 *       404:
 *         description: Subscription or plan not found
 *   delete:
 *     summary: Cancel user's subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose subscription to cancel
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot cancel other user's subscription
 *       404:
 *         description: Subscription not found
 */
router.get('/subscriptions/:userId', authMiddleware, getSubscription);
router.put('/subscriptions/:userId', authMiddleware, updateSubscription);
router.delete('/subscriptions/:userId', authMiddleware, cancelSubscription);

module.exports = router;