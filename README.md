# LiveShare - Real-time Collaboration App

 📸 Live Preview – Project Screenshots <div align="center">
  <a href="https://sharing-app-q4i6.onrender.com" target="_blank" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/%F0%9F%9F%A2%20Live%20Now%20-%20Click%20to%20Open-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</div>

<p align="center">
  <img src="https://github.com/user-attachments/assets/5e858ec1-2734-4661-85db-810812022f2e" alt="LiveShare Banner 1" width="1000px" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/40143d67-4d26-4589-8ae9-49fc98702cb9" alt="LiveShare Banner 2" width="1000px" />
</p>


LiveShare is a modern web application designed for seamless real-time collaboration. It allows multiple users to connect through unique room codes and share live video, audio, location, and files instantly. Perfect for remote teams, virtual hangouts, or quick content sharing.

## ✨ Features

-   **Room-Based Connections**: Create or join private rooms using unique, auto-generated codes.
-   **Live Video Streaming**: Real-time peer-to-peer video communication using WebRTC.
-   **Live Audio Sharing**: Crystal-clear audio transmission for voice communication.
-   **Real-time Location Sharing**: Share your live GPS location with other participants in the room.
-   **Instant File Sharing**: Easily upload and share files with everyone in the room.
-   **Responsive Design**: Optimized for a smooth experience across all devices (desktop, tablet, mobile).
-   **Modern UI**: Clean, intuitive, and visually appealing interface built with Tailwind CSS and Shadcn/ui.

## 🚀 Technologies Used

-   **Next.js 15 (App Router)**: React framework for building full-stack web applications.
-   **React 18**: Frontend library for building user interfaces.
-   **Socket.io**: For real-time, bidirectional event-based communication between clients and server.
-   **WebRTC**: For peer-to-peer audio and video streaming.
-   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
-   **Shadcn/ui**: Reusable UI components built with Radix UI and Tailwind CSS.
-   **Lucide React**: Beautiful and customizable open-source icons.

## 🛠️ Setup and Local Development

Follow these steps to get your LiveShare application up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: [Download & Install Node.js (LTS version recommended)](https://nodejs.org/en/download/)
-   **npm** (comes with Node.js) or **Yarn** (optional)
-   **Git** (optional, but recommended for version control)

### 1. Clone the Repository (or extract the downloaded code)

If you downloaded the code as a ZIP, extract it to your desired directory. If you're using Git:

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/live-share-app.git
cd live-share-app
\`\`\`

### 2. Install Dependencies

Navigate to the project root directory in your terminal and install the required packages. We use `--legacy-peer-deps` to handle potential peer dependency conflicts.

\`\`\`bash
npm install --legacy-peer-deps
# Or if you prefer Yarn:
# yarn install
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add the following:

\`\`\`env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NODE_ENV=development
\`\`\`

### 4. Configure Next.js

Ensure your `next.config.mjs` file is correctly configured for Socket.io:

\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['socket.io']
};

export default nextConfig;
\`\`\`

### 5. Add Middleware for Socket.io

Create a `middleware.ts` file in the root of your project:

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/socket')) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: '/api/socket/:path*',
}
\`\`\`

### 6. Configure PostCSS (for Tailwind CSS)

Create a `postcss.config.js` file in the root of your project:

\`\`\`javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
\`\`\`

### 7. Update Global CSS (for animations)

Ensure your `app/globals.css` includes the `fadeIn` keyframe:

\`\`\`css
/* ... existing Tailwind imports and base layers ... */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Add this to your root element or a specific component if you want to apply it */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
\`\`\`

### 8. Add Favicons

Place your favicon files directly in the `app` directory. Next.js will automatically pick them up. For example:

-   `app/favicon.ico`
-   `app/icon.png`
-   `app/apple-icon.png`

You can use placeholder images or generate your own.

### 9. Run the Development Server

Once all dependencies are installed and configurations are set, start the development server:

\`\`\`bash
npm run dev
# Or with Yarn:
# yarn dev
\`\`\`

The application will be accessible at `http://localhost:3000`.

## 💡 Usage Guide

1.  **Access the App**: Open your browser and go to `http://localhost:3000`.
2.  **Create a Room**: Enter your name and click "Create New Room". A unique room code will be generated.
3.  **Join a Room**: Share the room code with others. They can enter their name and the code on the homepage to join.
4.  **Live Video/Audio**: Click the "Video" and "Audio" buttons to toggle your camera and microphone. Grant permissions when prompted.
5.  **Live Location**: Click the "Location" button to share your real-time GPS location.
6.  **Share Files**: Click "Share File" to upload and share documents, images, or other files with room participants.

## 🌐 Deployment

You can deploy this application to various platforms. Here are instructions for Render and Vercel, two popular choices for Next.js applications.

### Deploying to Render.com

1.  **Create a GitHub Repository**: If you haven't already, create a new public GitHub repository and push your project code to it.
2.  **Go to Render**: Visit [render.com](https://render.com) and log in or sign up.
3.  **Create New Web Service**: Click "New +" -> "Web Service".
4.  **Connect GitHub**: Connect your GitHub account and select your `live-share-app` repository.
5.  **Configure Settings**:
    -   **Name**: `live-share-app` (or your preferred name)
    -   **Region**: Choose a region closest to your users.
    -   **Branch**: `main` (or your primary branch)
    -   **Root Directory**: Leave empty.
    -   **Runtime**: `Node`
    -   **Build Command**: `npm install --legacy-peer-deps && npm run build`
    -   **Start Command**: `npm start`
    -   **Node Version**: `18.17.0` (or a recent LTS version)
    -   **Auto-Deploy**: `Yes`
6.  **Environment Variables**: Add `NODE_ENV` with value `production`.
7.  **Create Web Service**: Click "Create Web Service" and wait for the deployment to complete. Your app will be live at `https://your-app-name.onrender.com`.

### Deploying to Vercel

Vercel is highly optimized for Next.js applications and often provides the simplest deployment experience.

1.  **Create a GitHub Repository**: Push your project code to a new public GitHub repository.
2.  **Go to Vercel**: Visit [vercel.com](https://vercel.com) and log in or sign up (GitHub login is recommended).
3.  **Import Project**: Click "Add New..." -> "Project".
4.  **Import Git Repository**: Select your `live-share-app` repository from GitHub.
5.  **Configure Project**: Vercel will automatically detect it's a Next.js project.
    -   **Root Directory**: Leave as default (`./`).
    -   **Build and Output Settings**: Vercel usually auto-configures these correctly for Next.js.
6.  **Deploy**: Click "Deploy". Vercel will build and deploy your application.
7.  **Live URL**: Once deployed, Vercel will provide you with a live URL (e.g., `https://live-share-app-xyz.vercel.app`).

## 🐛 Troubleshooting

-   **Dependency Conflicts (`ERESOLVE`)**: If `npm install` fails, try `npm install --legacy-peer-deps` or `npm install --force`. Clearing `node_modules` and `package-lock.json` before reinstalling can also help.
-   **`next` command not found**: Ensure you are running `npm run dev` or `npx next dev` from your project's root directory.
-   **WebRTC (Video/Audio) Issues**:
    -   WebRTC requires a secure context (HTTPS) for production environments. Both Render and Vercel provide HTTPS automatically.
    -   Ensure you grant camera and microphone permissions when prompted by your browser.
    -   Test on `localhost` first, as it's considered a secure context for development.
-   **Socket.io Connection Issues**: Check your browser's developer console for network errors. Ensure your server is running and accessible.

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License.
