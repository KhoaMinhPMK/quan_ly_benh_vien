import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { testConnection } from './config/database';
import authRoutes from './modules/auth/auth.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import bedsRoutes from './modules/beds/beds.routes';
import patientsRoutes from './modules/patients/patients.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import usersRoutes from './modules/users/users.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import reportsRoutes from './modules/reports/reports.routes';
import searchRoutes from './modules/search/search.routes';
import auditRoutes from './modules/audit/audit.routes';
import configRoutes from './modules/config/config.routes';
import accessRoutes from './modules/access/access.routes';
import wardsRoutes from './modules/wards/wards.routes';
import rulesRoutes from './modules/beds/rules.routes';
import saasRoutes from './modules/saas/saas.routes';
import extrasRoutes from './modules/config/extras.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { initWebPush } from './modules/notifications/push.service';

const app = express();

// Trust proxy (behind IIS/reverse proxy on VPS)
app.set('trust proxy', 1);

// Init Web Push
initWebPush();

// Middleware
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
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
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/config', configRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/wards', wardsRoutes);
app.use('/api/bed-rules', rulesRoutes);
app.use('/api/saas', saasRoutes);
app.use('/api/extras', extrasRoutes);

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
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
