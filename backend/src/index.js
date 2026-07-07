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

// Start DB and then Server
let dbInitPromise = null;
let isDbInitialized = false;

if (!process.env.VERCEL) {
  // Local: wait for DB before starting server
  async function startServer() {
    try {
      await initializeDatabase();
      isDbInitialized = true;
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
}

// Middleware to await DB init on Vercel before handling any request
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    if (!isDbInitialized) {
      if (!dbInitPromise) {
        dbInitPromise = initializeDatabase().then(() => {
          isDbInitialized = true;
        }).catch(err => {
          console.error('Database connection failed:', err);
        });
      }
      await dbInitPromise;
    }
  }
  next();
});

// Routes
app.use('/', behaviorRoutes);

// Healthcheck/status endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', time: new Date() });
});

import pg from 'pg';
app.get('/debug-db', async (req, res) => {
  try {
    let rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) return res.json({ error: 'No DATABASE_URL found in env.' });
    
    let strippedUrl = rawUrl.replace(/[&?]channel_binding=[^&]*/g, '');
    const pool = new pg.Pool({
      connectionString: strippedUrl,
      connectionTimeoutMillis: 5000,
      ssl: true
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    res.status(200).json({ 
      success: true, 
      time: result.rows[0],
      urlPrefix: strippedUrl.substring(0, 15) + '...'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message,
      errorStack: err.stack
    });
  }
});

import { getInitError } from './models/behavior.model.js';
app.get('/why-fallback', (req, res) => {
  res.status(200).json({ error: getInitError() });
});

export default app;
