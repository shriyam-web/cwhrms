const payload = {
  email: "test123@example.com",
  password: "testpass123",
  name: "Test User",
  role: "EMPLOYEE"
}

async function testSignup() {
  try {
    const response = await fetch("http://localhost:3003/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log("Status:", response.status)
    console.log("Response:", JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error:", error)
  }
}

testSignup()
