import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/behavior.model.js';
import behaviorRoutes from './routes/behavior.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Manually set CORS headers on every response — most reliable approach on Vercel
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, PUT, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  // Respond to preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// Routes
app.use('/', behaviorRoutes);

// Healthcheck/status endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', time: new Date() });
});

// Start DB and then Server
if (!process.env.VERCEL) {
  async function startServer() {
    try {
      await initializeDatabase();
      app.listen(PORT, () => {
        console.log(`==================================================`);
        console.log(` Behavioral Biometrics Server is running on port ${PORT}`);
        console.log(` Healthcheck available at: http://localhost:${PORT}/health`);
        console.log(`==================================================`);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }
  startServer();
} else {
  // On Vercel, initialize database on function invocation
  initializeDatabase().catch(err => console.error('Database connection failed:', err));
}

export default app;
