# RideBookingApp-backend

A backend service for a ride booking application with user authentication, vehicle management, and location services.

## Features

- User authentication (signup, login, logout)
- Vehicle management
- Location services
- API documentation with Swagger UI

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- MongoDB database

## Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd RideBookingApp-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Documentation

After starting the server, you can access the Swagger UI at:
- http://localhost:8000/api-docs

## Deployment

This application can be deployed to Vercel. Make sure to set up all required environment variables in your Vercel project settings.

## License

ISC
