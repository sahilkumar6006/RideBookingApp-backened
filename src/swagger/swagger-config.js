import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { userTags } from '../routes/user.routes.js';
import { vehicleTags } from '../routes/vehicle.routes.js';

// Combine all tags from different route files
const allTags = [
  ...userTags,
  ...vehicleTags,
  {
    name: 'Healthcheck',
    description: 'Health check endpoints'
  }
];

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ride Booking API',
      version: '1.0.0',
      description: 'API documentation for the Ride Booking Application',
      contact: {
        name: 'API Support',
        email: 'support@ridebooking.com',
        url: 'https://github.com/yourusername/RideBookingApp-backend'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      },
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com/api/v1',
        description: 'Production server (update this URL after deployment)',
      },
    ],
    tags: allTags,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: \'Bearer {token}\''
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Paths to files containing OpenAPI definitions
  apis: [
    './src/routes/*.js',
    './src/routes/*.js',
  ],
};

const specs = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  // Swagger page
  app.use('/api-docs', 
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Ride Booking API Documentation',
      customfavIcon: '/favicon.ico',
    })
  );

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(`📚 API Documentation available at http://localhost:${process.env.PORT || 8000}/api-docs`);
};

export default swaggerDocs;
