const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const favicon = require('serve-favicon');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const sequelize = require('./config/database');
const seedDatabase = require('./config/seeders');
const routes = require('./routes');
require('./worker/expirationWorker');

dotenv.config();
const app = express();

// Enable CORS
app.use(cors());

// Security middleware with updated CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "localhost:*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "http:", "localhost:*"],
      connectSrc: ["'self'", "localhost:*", "http://localhost:*", "http://localhost:3000"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));

// Rate limiting
app.use(rateLimiter);

// JSON parsing
app.use(express.json());

// Serve static files and favicon
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// API Routes
app.use('/api', routes);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Subscription Service API',
      version: '1.0.0',
      description: 'API documentation for the Subscription Service',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Plan: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Plan ID' },
            name: { type: 'string', description: 'Plan name' },
            price: { type: 'number', description: 'Plan price' },
            duration: { type: 'integer', description: 'Duration in days' }
          }
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Subscription ID' },
            userId: { type: 'integer', description: 'User ID' },
            planId: { type: 'integer', description: 'Plan ID' },
            status: { 
              type: 'string', 
              enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
              description: 'Subscription status'
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'User ID' },
            name: { type: 'string', description: 'User name' },
            email: { type: 'string', format: 'email', description: 'User email' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./routes.js', './controllers/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Database sync and server start
sequelize.sync().then(async () => {
  // Seed the database
  await seedDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});