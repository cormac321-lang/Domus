import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Management Platform API',
      version: '1.0.0',
      description: 'API documentation for the Property Management Platform',
      contact: {
        name: 'API Support',
        email: 'support@propertymanagement.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['tenant', 'landlord', 'admin'] },
            isVerified: { type: 'boolean' },
            profileImage: { type: 'string' },
            phoneNumber: { type: 'string' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['apartment', 'house', 'condo', 'townhouse'] },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            price: { type: 'number' },
            bedrooms: { type: 'number' },
            bathrooms: { type: 'number' },
            status: { type: 'string', enum: ['available', 'rented', 'maintenance'] }
          }
        },
        Maintenance: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            property: { type: 'string' },
            requestedBy: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'in-progress', 'completed', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'emergency'] }
          }
        },
        Chat: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['direct', 'property', 'maintenance'] },
            participants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sender: { type: 'string' },
                  content: { type: 'string' },
                  attachments: { type: 'array' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

export const specs = swaggerJsdoc(options); 