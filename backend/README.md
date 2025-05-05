# Property Management Platform Backend

A robust backend system for managing properties, tenants, maintenance requests, and communications.

## Features

- User Authentication & Authorization
- Property Management
- Maintenance Request System
- Real-time Chat
- File Upload & Management
- Email Notifications
- API Documentation
- Performance Monitoring
- Caching System

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Socket.IO
- Redis
- AWS S3
- JWT Authentication
- Swagger/OpenAPI

## Prerequisites

- Node.js >= 18.0.0
- MongoDB
- Redis
- AWS Account (for S3)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/property-management

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket_name

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

Once the server is running, you can access the API documentation at:
```
http://localhost:5000/api-docs
```

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── tests/          # Test files
│   ├── utils/          # Utility functions
│   └── index.js        # Application entry point
├── .env               # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 