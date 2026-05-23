# XSPLIT - Mobile Expense Splitting App

XSPLI is a high-performance, mobile-first web application designed to track and settle shared expenses. Built with a sleek Neobrutalist design, it simplifies complex group debts using a greedy algorithm to calculate optimal transactions. 

## 🚀 Features

- **Optimal Debt Simplification**: Automatically minimizes the total number of transactions needed to settle a group's debts.
- **Offline PWA Support**: Installable on mobile devices with instant loading via Service Workers.
- **Smart Splitting**: Split bills equally or manually.
- **Real-Time Consistency**: Intelligent backend caching ensures instantaneous balance updates without stale data.
- **Client-Side Compression**: Automatically compresses uploaded receipts (via HTML5 canvas) to save server storage and ensure lightning-fast uploads.
- **Activity Feed & Notifications**: Global timeline to track all group expenses and an in-app notification system.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS v3, Framer Motion, next-pwa
- **Backend**: Node.js, Express.js, Mongoose, JWT (HttpOnly Cookies), node-cache
- **Database**: MongoDB

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (Running locally or a cloud URI like MongoDB Atlas)

### Installation

1. Install dependencies for the root workspace:
   ```bash
   npm install
   ```
   *(This installs `concurrently` to run both servers easily).*

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Configuration

Create a `.env` file inside the `backend` folder and populate it based on the `backend/.env.example` file.

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/xpense
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:3000
```

### Running the App Locally

To start **both** the frontend and backend servers simultaneously from the root directory:

```bash
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend APIs**: `http://localhost:5000/api`

---

## 📱 PWA Instructions

To test the PWA features (installation, service workers) on your local machine, Next.js requires you to run a production build:

```bash
cd frontend
npm run build
npm run start
```
*Note: Ensure you add actual `icon-192x192.png` and `icon-512x512.png` files to `frontend/public` for full mobile installability.*
