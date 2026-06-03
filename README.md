# Pawly 🐾

Pawly is a modern, simplistic social media web application. This repository contains the complete full-stack solution, which is divided into two main components:

- **[Pawly Frontend](./pawly-frontend/)**: Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.
- **[Pawly Backend](./pawly-backend/)**: Built with Java 21, Spring Boot, and PostgreSQL.

## 🌟 Features
- **Authentication**: Secure JWT-based cookie authentication.
- **Social Feed**: View, create, and like posts and replies.
- **User Profiles**: Follow/unfollow users, view profiles and activities.
- **Responsive & Dark Mode**: Clean UI optimized for all devices with full dark mode support.

## 🚀 Getting Started

To run the application locally, you will need to set up both the backend and frontend components.

### Prerequisites
- Node.js and npm (or yarn/pnpm)
- Java 21
- Docker and Docker Compose (for the PostgreSQL database)

### 1. Start the Backend

Navigate to the backend directory and start the database and the application:

```bash
cd pawly-backend

# Start the PostgreSQL database
docker-compose up -d

# Run the Spring Boot application (Windows)
gradlew.bat bootRun

# Run the Spring Boot application (macOS/Linux)
./gradlew bootRun
```
The backend server will start on `http://localhost:8080`.

### 2. Start the Frontend

In a new terminal window, navigate to the frontend directory:

```bash
cd pawly-frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env.local with your Cloudinary credentials:
# NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
# NEXT_PUBLIC_CLOUDINARY_API_KEY="..."
# CLOUDINARY_API_SECRET="..."

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔗 Documentation
- [Frontend README](./pawly-frontend/README.md)
- [Backend README](./pawly-backend/README.md)
- [API Endpoints](./pawly-frontend/api_endpoints.md)
