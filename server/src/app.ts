import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { testConnection } from './config/database';
import authRoutes from './modules/auth/auth.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import bedsRoutes from './modules/beds/beds.routes';
import patientsRoutes from './modules/patients/patients.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'MedBoard API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/beds', bedsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function start() {
  try {
    await testConnection();

    app.listen(env.port, () => {
      console.log(`🚀 MedBoard API running at http://localhost:${env.port}`);
      console.log(`📋 Health check: http://localhost:${env.port}/api/health`);
      console.log(`🔑 Login API: POST http://localhost:${env.port}/api/auth/login`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
