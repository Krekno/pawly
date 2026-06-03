# Pawly Frontend

Pawly is a modern, simplistic social media web application. This repository contains the frontend, built with [Next.js 16](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS v4](https://tailwindcss.com/).

## 🌟 Features

- **Authentication**: Secure JWT-based cookie authentication (Sign in, Sign up, Profile update).
- **Social Feed**: View, create, and like posts and replies.
- **User Profiles**: Follow/unfollow users and view their profiles and activities.
- **Dark Mode**: Fully functional theme switching using `next-themes`.
- **Responsive Design**: Clean and minimalistic UI optimized for both desktop and mobile devices.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## ⚙️ Getting Started

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm/bun) installed.
You will also need to have the Pawly Backend running locally or deployed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pawly-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables. Create a `.env.local` file in the root directory and add your Cloudinary credentials for image uploads (along with any other required backend API URLs if needed):
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔗 API Integration

The frontend integrates with the Spring Boot backend via REST APIs. For a full list of available endpoints and their data structures, please refer to the [API Endpoints Documentation](./api_endpoints.md) included in this repository.
