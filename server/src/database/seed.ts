import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Run migration first
    const migrationPath = path.resolve(__dirname, '001_create_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    await db.execute(migrationSQL);
    console.log('✅ Migration executed: 001_create_users.sql');

    // Check if admin already exists
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', ['admin@medboard.vn']);
    if (Array.isArray(rows) && rows.length > 0) {
      console.log('ℹ️  Admin user already exists, skipping seed.');
      process.exit(0);
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    await db.execute(
      'INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?)',
      ['admin@medboard.vn', passwordHash, 'Admin MedBoard', 'admin', true]
    );
    console.log('✅ Admin user created: admin@medboard.vn / Admin@123');

    // Create sample users
    const sampleUsers = [
      { email: 'bacsi@medboard.vn', name: 'BS. Nguyễn Văn A', role: 'doctor' },
      { email: 'dieuduong@medboard.vn', name: 'ĐD. Trần Thị B', role: 'nurse' },
      { email: 'hoso@medboard.vn', name: 'NV. Lê Văn C', role: 'records_staff' },
    ];

    for (const user of sampleUsers) {
      const hash = await bcrypt.hash('User@123', 10);
      await db.execute(
        'INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES (?, ?, ?, ?, ?)',
        [user.email, hash, user.name, user.role, true]
      );
      console.log(`✅ User created: ${user.email} / User@123`);
    }

    console.log('🎉 Seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
