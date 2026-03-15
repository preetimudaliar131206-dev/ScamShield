const fetch = require('node-fetch');

async function testEmailScan() {
    console.log("Testing Email Scan API...");
    const response = await fetch('http://localhost:3000/api/detect-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_text: "Subject: Urgent: Security Alert\n\nBody: Your account has been suspended. Click bit.ly/verify to fix." })
    });
    const result = await response.json();
    console.log("Email Scan Result:", JSON.stringify(result, null, 2));
}

async function testChatApi() {
    console.log("\nTesting Chat API...");
    const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "I think I found a scam." })
    });
    const result = await response.json();
    console.log("Chat API Response:", JSON.stringify(result, null, 2));
}

testEmailScan().then(testChatApi);
