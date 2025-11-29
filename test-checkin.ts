import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-32-chars-long-!!!"

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)), iv)
  let encrypted = cipher.update(token, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

async function testCheckIn() {
  try {
    console.log("[TEST] Starting check-in test...\n")

    // Generate test QR token
    const uniqueToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const encryptedToken = encryptToken(uniqueToken)

    console.log("[TEST] Generated token:", uniqueToken)
    console.log("[TEST] Encrypted token:", encryptedToken)

    // Sample payload
    const payload = {
      encryptedToken,
      employeeCode: "CW/TEST-0001",
      deviceId: "device-test-001",
      latitude: 12.9716,
      longitude: 77.5946,
    }

    console.log("\n[TEST] Sending payload:", payload)

    // Make API request
    const response = await fetch("http://localhost:3000/api/attendance/check-in-public", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    console.log("\n[TEST] Response status:", response.status)

    const data = await response.json()
    console.log("[TEST] Response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error("\n[TEST] ❌ Check-in failed!")
    } else {
      console.log("\n[TEST] ✓ Check-in successful!")
    }
  } catch (error) {
    console.error("[TEST] Error:", error)
  }
}

testCheckIn()
