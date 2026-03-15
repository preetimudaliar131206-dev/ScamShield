const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        }, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function runTests() {
    try {
        console.log("Testing /api/detect-scam...");
        const scamResult = await post('/api/detect-scam', { message_text: "Urgent: Account blocked. bit.ly/scam" });
        console.log("Result:", scamResult.risk_level, scamResult.confidence_score);

        console.log("\nTesting /api/chat...");
        const chatResult = await post('/api/chat', { message: "I won a lottery" });
        console.log("Result:", chatResult.response);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

runTests();
