# SIGNALX - MERN Stack Project

SIGNALX is a pre-configured, complete MERN (MongoDB, Express, React, Node.js) stack project structure designed for scale.

## Project Structure

```text
SIGNALX/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/             # Images, fonts, and static resources
│   │   ├── components/         # Reusable presentation components
│   │   ├── context/            # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page layouts
│   │   ├── pages/              # Page views / routed components
│   │   ├── services/           # API call services (Axios config, endpoints)
│   │   ├── utils/              # Helper functions & constants
│   │   ├── App.jsx             # Main Application component & routes
│   │   ├── index.css           # Global stylesheet (Tailwind CSS v4)
│   │   └── main.jsx            # Application entry point
│   ├── package.json
│   ├── vercel.json             # Vercel SPA routing rules
│   └── vite.config.js          # Vite config with Tailwind CSS v4 plugin
│
└── server/                     # Backend (Node.js + Express)
    ├── config/                 # Configurations (DB connection, third-party services)
    │   └── db.js               # MongoDB connection setup
    ├── controllers/            # Request handlers
    ├── middlewares/            # Custom Express middlewares (Auth, validation)
    ├── models/                 # Mongoose schemas & models
    ├── routes/                 # Express routes
    ├── services/               # Business logic services
    ├── utils/                  # Helper utilities and handlers
    ├── .env                    # Local environment variables
    ├── .env.example            # Environment variables template
    ├── package.json
    └── server.js               # Express application entry point
```

## Technologies & Dependencies

### Frontend (Client)
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v4 (CSS-first zero config, integration via `@tailwindcss/vite`)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend (Server)
- **Runtime**: Node.js & Express
- **Database**: MongoDB (via Mongoose ODM)
- **Utilities & Middleware**:
  - `dotenv` (Environment variable management)
  - `cors` (Cross-Origin Resource Sharing)
  - `morgan` (HTTP request logger)
  - `bcrypt` (Password hashing)
  - `jsonwebtoken` (JWT token auth utilities)
  - `multer` (File upload handling)
  - `nodemon` (Development file watching & hot-reload)

---

## Getting Started

### Prerequisites
- Node.js installed locally
- MongoDB database running (locally or MongoDB Atlas URI)

### Setup & Installation

1. Clone the repository.
2. Configure environmental variables for the backend:
   ```bash
   cd server
   cp .env.example .env
   ```
   *Edit the generated `.env` file to customize your Mongo connection string and JWT secret.*

3. Install dependencies:
   * For the frontend:
     ```bash
     cd client
     npm install
     ```
   * For the backend:
     ```bash
     cd server
     npm install
     ```

### Running the Project

#### Run Frontend (Vite Dev Server)
```bash
cd client
npm run dev
```

#### Run Backend (Nodemon Live Server)
```bash
cd server
npm run dev
```

---

## Production Deployment Instructions

### 1. Database Setup: MongoDB Atlas
1. Sign up/log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Database Cluster (Shared free tier is sufficient).
3. Under **Database Access**, create a database user with read/write privileges and copy the secure credentials.
4. Under **Network Access**, add an IP entry `0.0.0.0/0` to allow connections from any hosting provider (e.g. Render/Vercel).
5. Click **Connect** on your cluster, select **Drivers**, and copy the connection string (`MONGO_URI`). Replace `<password>` with your user's password.

### 2. Backend Deployment: Render
1. Sign up/log in to [Render](https://render.com).
2. Click **New** and select **Web Service**.
3. Connect your GitHub repository containing the MERN project.
4. Set the following build configurations:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add the following keys:
   - `PORT`: `5000` (or leave default to let Render bind automatically)
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `CLIENT_URL`: *Your Vercel frontend URL (once deployed)*
   - `GEMINI_API_KEY`: *Your Google Gemini API key*
6. Click **Deploy Web Service** and copy your backend service URL.

### 3. Frontend Deployment: Vercel
1. Sign up/log in to [Vercel](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Connect your GitHub repository.
4. Set the following build configurations:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: *Your Render backend URL followed by `/api`* (e.g. `https://signalx-backend.onrender.com/api`)
6. Click **Deploy**. Vercel will build the frontend assets and automatically apply the SPA routing rules configured in `client/vercel.json`.
