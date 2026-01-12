# Comment System Frontend

A professional, production-grade comment system built with React, TypeScript, Vite, and Redux Toolkit.

## 🚀 Features

- ⚡ **Lightning Fast** - Powered by Vite for instant HMR and optimized builds
- 🔐 **Authentication** - JWT-based auth with protected routes
- 💬 **Real-time Comments** - WebSocket integration with Socket.io
- 👍 **Like/Dislike System** - One-time voting per user
- 🔄 **Sorting & Pagination** - Sort by newest, most liked, or most disliked
- 💬 **Nested Replies** - Support for comment threads
- 🎨 **Modern UI** - Professional design system with CSS variables
- 📱 **Responsive** - Mobile-first design
- 🔒 **Type-Safe** - Full TypeScript support
- 🏗️ **Scalable Architecture** - Feature-based folder structure

## 📦 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Toastify** - Toast notifications

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and configure your environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── comments/       # Comment-specific components
│   └── auth/           # Authentication components
├── pages/              # Page components
├── store/              # Redux store
│   ├── slices/        # Redux slices
│   └── store.ts       # Store configuration
├── services/           # API and external services
│   ├── api.ts         # Axios instance
│   └── socket.ts      # Socket.io service
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🎯 Next Steps

1. Share your Postman collection to integrate with your backend API
2. Build authentication pages (Login/Register)
3. Create comment components
4. Implement real-time features
5. Add comprehensive testing

## 📝 License

ISC
