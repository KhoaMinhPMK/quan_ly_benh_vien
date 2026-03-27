import dotenv from 'dotenv';
import path from 'path';

// Load .env from server root (process.cwd)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Fallback: also try __dirname-based paths
if (!process.env.DB_PASSWORD) {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}
if (!process.env.DB_PASSWORD) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

export const env = {
  port: parseInt(process.env.PORT || '3011', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME || 'medboard',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'medboard-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
};

if (env.nodeEnv === 'production' && env.jwt.secret === 'medboard-jwt-secret-change-in-production') {
  console.warn('\n⚠️ [WARNING] Dùng JWT secret MẶC ĐỊNH trong môi trường PRODUCTION! ⚠️');
  console.warn('Vui lòng cấu hình biến môi trường JWT_SECRET để đảm bảo an toàn.\n');
}
