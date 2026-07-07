import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './models/behavior.model.js';
import behaviorRoutes from './routes/behavior.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For PoC, allow all origins
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
