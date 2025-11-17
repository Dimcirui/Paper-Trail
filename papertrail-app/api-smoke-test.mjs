// -----------------------------------------------------------
// 1. Setup Configuration
// -----------------------------------------------------------
const API_URL = "http://localhost:3000/api/papers";
const AUTH_TOKEN = process.env.API_AUTH_TOKEN || "my-secret-token"; 

// Roles: Admin and Contributor
// const ROLE_ADMIN = "research_admin";
const ROLE_ADMIN = "admin";
const ROLE_CONTRIB = "contributor";

// Sample Payload: Ensure primaryContactId exists (we previously inserted ID=1)
const TEST_PAPER_PAYLOAD = {
  title: `Test Paper - ${Date.now()}`,
  abstract: "Testing API route with Node.js fetch.",
  primaryContactId: 1, // Ensure this user ID exists in the database
  status: "Submitted",
};

// -----------------------------------------------------------
// 2. Core Test Function
// -----------------------------------------------------------

async function testApi(role, expectedStatus, testName, payload = TEST_PAPER_PAYLOAD) {
  console.log(`\n--- Running Test: ${testName} (Role: ${role}) ---`);
  
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${AUTH_TOKEN}`,
    "x-user-role": role,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    // Check HTTP status code
    if (response.status === expectedStatus) {
      console.log(`✅ Success! Received expected status: ${expectedStatus}`);
    } else {
      console.error(`❌ Failed! Expected ${expectedStatus}, but got ${response.status}.`);
      console.error("Error Detail:", data.error);
    }
  } catch (error) {
    console.error(`Fatal Error during fetch: ${error.message}`);
  }
}

// -----------------------------------------------------------
// 3. Run Tests
// -----------------------------------------------------------

async function runTests() {
  // 确保 dev server 正在运行： npm run dev
  // Ensure the dev server is running: npm run dev
  
  // Test 1: Admin (WRITE_ROLES) should successfully create a paper
  await testApi(ROLE_ADMIN, 201, "Admin Create Paper");

  // Test 2: Contributor (non-WRITE_ROLES) should be denied (403 Forbidden)
  await testApi(ROLE_CONTRIB, 403, "Contributor Denied Create");
  
  // Test 3: Missing required fields should be denied (400 Bad Request)
  await testApi(ROLE_ADMIN, 400, "Admin Missing Title", { primaryContactId: 1 });
}

runTests();