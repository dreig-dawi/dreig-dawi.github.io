# Cheffin Frontend

This is the frontend component of the Cheffin application - a platform to connect users with professional chefs.

## Overview

The Cheffin frontend is built with React and provides a responsive user interface for:
- User authentication (login/registration)
- Browsing chef profiles
- Real-time chat functionality
- User and chef profile management

## Technology Stack

- React 19
- Material UI 7
- PrimeReact 10
- Socket.io Client for real-time communication
- Axios for API requests
- JWT authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

```bash
# Navigate to the frontend directory
cd FrontEnd/cheffin

# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory with the following content:

```
REACT_APP_API_URL=http://localhost:8080
```

For production, the API endpoint is configured in `src/Utils/Constants.ts`.

### Running the Application

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

### Deployment

The frontend is configured for deployment to GitHub Pages:

```bash
npm run deploy
```

## Project Structure

```
cheffin/
├── public/               # Static files
│   ├── icons/            # Application icons
│   └── index.html        # HTML template
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Auth/         # Authentication components
│   │   ├── Chat/         # Chat interface components
│   │   ├── Layout/       # Layout components
│   │   └── Profile/      # Profile components
│   ├── context/          # React context providers
│   │   └── AuthContext.js # Authentication context
│   ├── Home/             # Home page component
│   ├── pages/            # Application pages
│   │   ├── Chat/         # Chat page
│   │   ├── ChefProfile/  # Chef profile page
│   │   ├── Dashboard/    # User dashboard
│   │   ├── Login/        # Login page
│   │   ├── NotFound/     # 404 page
│   │   ├── Register/     # Registration page
│   │   └── UserProfile/  # User profile page
│   ├── Utils/            # Utility functions and constants
│   │   ├── Constants.ts  # Application constants
│   │   └── Utils.tsx     # Helper functions
│   ├── App.js            # Main application component
│   └── index.js          # Application entry point
└── package.json          # NPM package configuration
```

## Learn More

For more detailed information about the entire Cheffin project, including the backend implementation and deployment instructions, refer to the [main project README](../README.md).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects the app from Create React App
- `npm run deploy` - Deploys the app to GitHub Pages
