# Pawly Backend

The backend service for the **Pawly** social media application. Built with modern Java and Spring Boot, this RESTful API provides robust features including secure authentication, user management, and post interactions.

This project is the backend counterpart to the **Pawly Frontend**, which is built using **Next.js 16** and **TypeScript**.

## 🚀 Tech Stack

- **Core:** Java 21, Spring Boot
- **Security:** Spring Security, JWT (Cookie-based Authentication)
- **Database:** PostgreSQL, Spring Data JPA
- **Build Tool:** Gradle (Kotlin DSL)
- **Infrastructure:** Docker, Docker Compose

## 📦 Features

- **Authentication:** Secure user registration, login, and session management using HTTP-only cookies with JWT.
- **User Management:** Profile fetching and profile update functionality.
- **Post Management:** Create, read, update, and delete (CRUD) operations for posts. Includes a global feed and individual post details.

## 🛠️ Local Development Setup

### Prerequisites
- [Java 21](https://jdk.java.net/21/) installed
- [Docker](https://www.docker.com/) and Docker Compose installed

### 1. Start the Database
A `docker-compose.yml` file is provided to quickly set up a local PostgreSQL instance.

```bash
docker-compose up -d
```
This will start PostgreSQL on port `5433` with the default database `pawly`.

### 2. Run the Application
Start the Spring Boot application using the included Gradle wrapper:

**On Windows:**
```cmd
gradlew.bat bootRun
```

**On macOS/Linux:**
```bash
./gradlew bootRun
```
The server will typically start on `http://localhost:8080`.

## 🔌 API Overview

The backend exposes several RESTful endpoints to support the frontend application:

- **Authentication (`/api/auth`)**:
  - Registration and Login endpoints.
  - `/api/auth/me`: Retrieves the currently authenticated user's session data based on the JWT cookie.
- **Users (`/api/users`)**:
  - `/api/users/[username]`: Fetch user profiles and handle profile updates.
- **Posts (`/api/posts`)**:
  - Endpoints to fetch the feed, view post details, and handle post deletion/creation.

## 🔒 Security Notes
Authentication relies on secure, HTTP-only JWT cookies. For local development, ensure that your frontend and backend are configured appropriately (e.g., `SameSite` cookie attributes) to allow cross-origin requests during testing.
