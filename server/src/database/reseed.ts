/**
 * reseed.ts — Re-import seed data with correct UTF-8 encoding
 * 
 * Sử dụng:
 *   cd server
 *   npx ts-node src/database/reseed.ts
 * 
 * Script này sẽ:
 *  1. SET NAMES utf8mb4 trên connection
 *  2. Xóa dữ liệu cũ (patients, beds, rooms, checklists, bed_history) 
 *  3. Chạy lại 003_seed_data.sql với đầy đủ tiếng Việt có dấu
 */

import { db } from '../config/database';
import fs from 'fs';
import path from 'path';

async function reseed() {
  console.log('🔄 Re-seeding database with correct UTF-8 data...');

  const conn = await db.getConnection();
  try {
    // 1. Ensure charset is utf8mb4 on this connection
    await conn.execute("SET NAMES 'utf8mb4'");
    await conn.execute("SET CHARACTER SET utf8mb4");
    console.log('✅ Connection charset set to utf8mb4');

    // 2. Disable FK checks and clean old data
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const tablesToClean = [
      'patient_checklists',
      'bed_history',
      'patients',
      'beds',
      'rooms',
    ];

    for (const table of tablesToClean) {
      await conn.execute(`DELETE FROM ${table}`);
      await conn.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      console.log(`  🗑️  Cleaned: ${table}`);
    }
    
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old data cleaned');

    // 3. Run seed SQL file (003_seed_data.sql)
    const seedPath = path.resolve(__dirname, '003_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = seedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await conn.execute(stmt);
      } catch (err: any) {
        // Skip comment-only lines or empty statements
        if (err.code === 'ER_EMPTY_QUERY') continue;
        console.error(`❌ Error executing statement:`, err.message);
        console.error(`   Statement: ${stmt.substring(0, 80)}...`);
      }
    }
    console.log('✅ Seed data imported with correct Vietnamese diacritics');

    // 4. Verify — check one patient name to confirm diacritics
    const [rows] = await conn.execute(
      "SELECT patient_code, full_name, diagnosis FROM patients WHERE patient_code = 'BN001'"
    ) as any;
    
    if (rows.length > 0) {
      const p = rows[0];
      console.log(`\n🔍 Verification:`);
      console.log(`   Patient: ${p.full_name}`);
      console.log(`   Diagnosis: ${p.diagnosis}`);
      
      const hasDiacritics = /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(p.full_name);
      if (hasDiacritics) {
        console.log(`   ✅ Diacritics confirmed! Data is correct.`);
      } else {
        console.log(`   ⚠️  No diacritics found — may still have encoding issue.`);
        console.log(`   → Check that database/table charset is utf8mb4`);
      }
    }

    console.log('\n🎉 Re-seed completed!');
  } catch (error) {
    console.error('❌ Re-seed failed:', error);
  } finally {
    conn.release();
    process.exit(0);
  }
}

reseed();
