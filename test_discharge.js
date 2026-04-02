const mysql = require('C:/inetpub/wwwroot/quanlybenhvien/server/node_modules/mysql2/promise');
(async () => {
  const db = await mysql.createPool({ host:'localhost', user:'root', password:'123456', database:'medboard' });
  
  // Test 1: Simple query
  const [r1] = await db.execute("SELECT a.id, a.status FROM admissions a WHERE a.status = 'waiting_discharge'");
  console.log('Test1 simple:', JSON.stringify(r1));
  
  // Test 2: With param
  const [r2] = await db.execute("SELECT a.id, a.status FROM admissions a WHERE a.status IN ('treating','waiting_discharge') AND (a.status = ? OR (a.expected_discharge IS NOT NULL AND a.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)))", ['waiting_discharge']);
  console.log('Test2 with param:', JSON.stringify(r2));
  
  // Test 3: Full query
  const sql = `SELECT a.id, a.patient_id, p.patient_code, p.full_name, a.status, a.expected_discharge
    FROM admissions a JOIN patients p ON a.patient_id = p.id LEFT JOIN beds b ON a.bed_id = b.id LEFT JOIN rooms r ON b.room_id = r.id
    WHERE a.status IN ('treating', 'waiting_discharge')
    AND (a.status = ? OR (a.expected_discharge IS NOT NULL AND a.expected_discharge <= DATE_ADD(CURDATE(), INTERVAL 1 DAY)))
    ORDER BY a.expected_discharge ASC`;
  const [r3] = await db.execute(sql, ['waiting_discharge']);
  console.log('Test3 full query:', JSON.stringify(r3));
  
  await db.end();
})();
