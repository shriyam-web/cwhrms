const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-!!!';

function encryptToken(token) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

async function test() {
  try {
    console.log('[TEST] ============================================');
    console.log('[TEST] Testing Attendance Check-in with CW/GNO-2707');
    console.log('[TEST] ============================================\n');

    // Step 1: Generate QR token (simulating QR generation)
    console.log('[TEST] Step 1: Generating test QR token...');
    const token = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const encryptedToken = encryptToken(token);
    console.log('[TEST] ✓ Token generated (encrypted)');

    // Step 2: Test check-in
    console.log('\n[TEST] Step 2: Submitting check-in request...');
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
      return;
    }

    console.log('[TEST] ✓ CHECK-IN SUCCESSFUL!');
    console.log('[TEST] Message:', checkInData.message);
    console.log('[TEST] Type:', checkInData.type);
    console.log('[TEST] Employee:', checkInData.employeeName);
    console.log('[TEST] Time:', checkInData.time);

    console.log('\n[TEST] ============================================');
    console.log('[TEST] ✓ TEST PASSED - Attendance recorded');
    console.log('[TEST] ============================================');
  } catch (e) {
    console.error('[TEST] ✗ Error:', e.message);
    console.error('[TEST] Stack:', e.stack);
  }
}

test();
