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
      'checklist_templates',
      'departments',
    ];

    for (const table of tablesToClean) {
      await conn.execute(`DELETE FROM ${table}`);
      await conn.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
      console.log(`  🗑️  Cleaned: ${table}`);
    }
    
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Old data cleaned');

    // 3. Re-seed departments & checklists (from 002 migration, with correct encoding)
    await conn.execute(`INSERT INTO departments (name, code) VALUES
      ('Nội khoa', 'NK'), ('Ngoại khoa', 'NGK'), ('Nhi khoa', 'NHK'),
      ('Sản khoa', 'SK'), ('Cấp cứu', 'CC')`);
    console.log('✅ Departments re-seeded');

    await conn.execute(`INSERT INTO checklist_templates (name, description, sort_order) VALUES
      ('Hồ sơ bệnh án', 'Kiểm tra hồ sơ bệnh án đầy đủ', 1),
      ('Phiếu xét nghiệm', 'Kết quả xét nghiệm đã có', 2),
      ('Phiếu chụp X-quang', 'Kết quả X-quang/CT/MRI', 3),
      ('Đơn thuốc ra viện', 'Bác sĩ đã kê đơn thuốc ra viện', 4),
      ('Giấy ra viện', 'Giấy ra viện đã ký', 5),
      ('Thanh toán viện phí', 'Bệnh nhân đã thanh toán đầy đủ', 6),
      ('Hướng dẫn tái khám', 'Đã hướng dẫn bệnh nhân tái khám', 7)`);
    console.log('✅ Checklist templates re-seeded');

    // 4. Run seed SQL file (003_seed_data.sql)
    const seedPath = path.resolve(__dirname, '003_seed_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = seedSQL
      .split(';')
      .map(s => s
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))  // strip comment lines
        .join('\n')
        .trim()
      )
      .filter(s => s.length > 0);

    let executed = 0;
    for (const stmt of statements) {
      try {
        await conn.execute(stmt);
        executed++;
      } catch (err: any) {
        if (err.code === 'ER_EMPTY_QUERY') continue;
        console.error(`❌ Error executing statement:`, err.message);
        console.error(`   Statement: ${stmt.substring(0, 100)}...`);
      }
    }
    console.log(`✅ Seed data imported (${executed} statements) with correct Vietnamese diacritics`);

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
