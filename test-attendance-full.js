const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-!!!';

function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

async function testWithMongo() {
  try {
    console.log('[TEST] ============================================');
    console.log('[TEST] Testing Attendance Check-in FULL FLOW');
    console.log('[TEST] Employee: CW/GNO-2707');
    console.log('[TEST] ============================================\n');

    // Connect to MongoDB and create test QR token
    console.log('[TEST] Step 1: Creating test QR token in database...');
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017');
    
    await client.connect();
    const db = client.db('citywitty-hrms');
    const qrTokensCollection = db.collection('qrTokens');
    
    // Create a test QR token
    const testToken = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const encryptedToken = encryptToken(testToken);
    
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 1000); // 30 seconds
    
    const insertResult = await qrTokensCollection.insertOne({
      token: testToken,
      encryptedToken,
      isUsed: false,
      usedAt: null,
      createdAt: now,
      expiresAt,
      officeId: 'test-office'
    });
    
    console.log('[TEST] ✓ QR Token created in database');
    console.log('[TEST]   Token ID:', insertResult.insertedId.toString());
    console.log('[TEST]   Expires at:', expiresAt.toISOString());

    // Step 2: Check if employee exists in database
    console.log('\n[TEST] Step 2: Checking if employee CW/GNO-2707 exists...');
    const employeesCollection = db.collection('employeeProfiles');
    const employee = await employeesCollection.findOne({ employeeCode: 'CW/GNO-2707' });
    
    if (!employee) {
      console.error('[TEST] ✗ Employee CW/GNO-2707 not found in database');
      await client.close();
      return;
    }
    
    console.log('[TEST] ✓ Employee found');
    console.log('[TEST]   Name:', employee.name);
    console.log('[TEST]   Email:', employee.email);
    console.log('[TEST]   ID:', employee._id.toString());

    // Step 3: Test check-in
    console.log('\n[TEST] Step 3: Submitting check-in request...');
    const payload = {
      encryptedToken,
      employeeCode: 'CW/GNO-2707',
      deviceId: 'test-device-' + Date.now(),
      latitude: 12.9716,
      longitude: 77.5946
    };

    console.log('[TEST] Request Payload:');
    console.log('[TEST]   Employee Code: CW/GNO-2707');
    console.log('[TEST]   Device ID:', payload.deviceId);
    console.log('[TEST]   Location: 12.9716, 77.5946');

    const checkInResp = await fetch('http://localhost:3000/api/attendance/check-in-public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('\n[TEST] Response received:');
    console.log('[TEST] Status:', checkInResp.status);

    const checkInData = await checkInResp.json();
    
    if (!checkInResp.ok) {
      console.error('[TEST] ✗ CHECK-IN FAILED');
      console.error('[TEST] Error:', checkInData.error);
      await client.close();
      return;
    }

    console.log('[TEST] ✓ CHECK-IN SUCCESSFUL!');
    console.log('[TEST] Message:', checkInData.message);
    console.log('[TEST] Type:', checkInData.type);
    console.log('[TEST] Employee:', checkInData.employeeName);
    console.log('[TEST] Time:', checkInData.time);

    // Step 4: Verify attendance was recorded
    console.log('\n[TEST] Step 4: Verifying attendance was recorded in database...');
    const attendanceCollection = db.collection('attendanceLogs');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const attendance = await attendanceCollection.findOne({
      employeeId: employee._id.toString(),
      checkInTime: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (!attendance) {
      console.error('[TEST] ✗ Attendance record not found');
      await client.close();
      return;
    }
    
    console.log('[TEST] ✓ Attendance record found!');
    console.log('[TEST]   ID:', attendance._id.toString());
    console.log('[TEST]   Check-in Time:', attendance.checkInTime.toISOString());
    console.log('[TEST]   Check-out Time:', attendance.checkOutTime ? attendance.checkOutTime.toISOString() : 'Not checked out');
    console.log('[TEST]   Location:', `${attendance.latitude}, ${attendance.longitude}`);
    console.log('[TEST]   Device:', attendance.deviceId);
    console.log('[TEST]   Status:', attendance.status);

    console.log('\n[TEST] ============================================');
    console.log('[TEST] ✓✓✓ ALL TESTS PASSED ✓✓✓');
    console.log('[TEST] Attendance system is working correctly!');
    console.log('[TEST] ============================================');
    
    await client.close();
  } catch (e) {
    console.error('[TEST] ✗ Error:', e.message);
    console.error('[TEST] Stack:', e.stack);
  }
}

testWithMongo();
