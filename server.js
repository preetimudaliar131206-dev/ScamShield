const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve scam.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'scam.html'));
});

// Serve static files from the current directory
app.use(express.static(__dirname));

// NLP Scam Pattern Detection Rules
const PHISHING_KW = ["verify your account", "suspended", "click here", "otp", "account will be blocked", "unusual activity", "confirm your details", "update your information", "security alert", "kyc expired", "blocked", "authenticate", "login", "your account", "bit.ly", "tinyurl", "link", "update immediately", "scam alert", "phishing detected", "detected scam", "fake alert"];
const URGENCY_KW  = ["urgent", "immediate action", "act now", "immediately", "right now", "limited time", "within 24 hours", "before it expires", "permanently blocked", "funds seized", "2 hours", "account risk", "high risk", "warning"];
const PERSONAL_KW = ["pin", "password", "cvv", "social security", "aadhaar", "bank account", "account number", "credit card", "debit card", "ifsc", "atm", "mpin"];
const LURE_KW     = ["won", "prize", "lottery", "inheritance", "refund", "tax refund", "unclaimed", "bitcoin", "crypto", "double your money", "guaranteed returns", "wire transfer", "gift card", "₹25", "reward", "congratulations", "bonus cash", "cashback claim"];
const SAFE_KW     = ["if not done by you", "we will never ask", "official", "call back", "reference number", "your branch", "visit your bank", "-sbi", "-hdfc", "-icici", "-axis"];
const EMAIL_KW    = ["noreply", "unsubscribe", "view in browser", "legal notice", "confidentiality", "security officer", "customer support", "support id", "case #"];

// Helper to extract specific link patterns
function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)|(bit\.ly\/[^\s]+)|(tinyurl\.com\/[^\s]+)|(www\.[^\s]+)/gi;
  return text.match(urlRegex) || [];
}

// Core Scam Detection Engine
function analyzeMessageText(text) {
  const lower = text.toLowerCase();
  
  const p = PHISHING_KW.filter(k => lower.includes(k));
  const u = URGENCY_KW.filter(k => lower.includes(k));
  const d = PERSONAL_KW.filter(k => lower.includes(k));
  const l = LURE_KW.filter(k => lower.includes(k));
  const s = SAFE_KW.filter(k => lower.includes(k));
  const e = EMAIL_KW.filter(k => lower.includes(k));
  
  const allPatterns = [...new Set([...p, ...u, ...d, ...l, ...e])];
  const links = extractLinks(text);
  if (links.length > 0) {
      allPatterns.push('Suspicious links detected: ' + links.join(', '));
  }

  let score = p.length * 14 + u.length * 16 + d.length * 15 + l.length * 12 + e.length * 10 - s.length * 18;
  if (/don'?t tell|do not inform|keep this confidential/i.test(text)) score += 22;
  
  // Link penalty
  if (links.length > 0) score += 15;
  if (links.some(l => /bit\.ly|tinyurl|is\.gd|t\.co/i.test(l))) score += 25;

  score = Math.max(0, Math.min(100, score));
  
  let risk_level, explanation;
  
  if (score >= 70) {
    risk_level = "SCAM";
    explanation = "High risk indicators found. Contains multiple scam keywords, urgency, or suspicious links. Do not engage.";
  } else if (score >= 35) {
    risk_level = "SUSPICIOUS";
    explanation = "Some risky patterns detected. Could be legitimate or a soft scam. Verify independently before acting.";
  } else {
    risk_level = "SAFE";
    explanation = "No strong scam signals detected. Appears to be a standard or safe communication.";
  }

  return {
    risk_level,
    confidence_score: score,
    explanation,
    detected_patterns: allPatterns
  };
}

// Mock Phone Reputation Database
const SCAM_NUMBERS = {
  "+911234567890": { reports: 154, risk: "HIGH", tag: "Fake Bank Support" },
  "0224567812": { reports: 89, risk: "HIGH", tag: "Insurance Scam" },
  "+919876543210": { reports: 2, risk: "LOW", tag: "General" }
};

app.post('/api/detect-scam', (req, res) => {
  const { message_text } = req.body;
  if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
    return res.status(400).json({ error: 'message_text is required' });
  }
  const result = analyzeMessageText(message_text);
  res.json(result);
});

app.get('/api/check-phone', (req, res) => {
  const number = req.query.number;
  if (!number) return res.status(400).json({ error: 'Phone number is required' });
  
  const data = SCAM_NUMBERS[number] || { reports: 0, risk: "SAFE", tag: "Unknown" };
  res.json({
    number,
    ...data,
    explanation: data.risk === "HIGH" ? `This number has been flagged by ${data.reports} users as possible ${data.tag.toLowerCase()}.` : "No prior reports found for this number."
  });
});

app.post('/api/report-scam', (req, res) => {
  const { message, type } = req.body;
  // In a real app, this would save to a DB
  console.log(`[REPORT RECEIVED] Type: ${type}, Content: ${message.substring(0, 50)}...`);
  res.json({ success: true, message: "Scam reported successfully. Thank you for keeping Shield active!" });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const text = message.toLowerCase();
  
  // First, run full analysis
  const analysis = analyzeMessageText(message);
  
  let response = "";

  if (analysis.confidence_score >= 35) {
    response = `⚠️ ANALYSIS RESULT: This message looks ${analysis.risk_level.toLowerCase()} (Risk Score: ${analysis.confidence_score}/100).\n\n${analysis.explanation}\n\nDetected Signals: ${analysis.detected_patterns.slice(0, 3).join(', ')}...`;
  } else if (text.includes("scam") || text.includes("check") || text.includes("analyze")) {
    response = "I can analyze any message for you! Just paste the SMS or email text here, and I'll run a safety scan. You can also use the Message Analyzer for screenshots.";
  } else if (text.includes("lottery") || text.includes("won") || text.includes("prize")) {
    response = "Lottery and prize scams are very common. Never share your OTP, PIN, or bank details to claim a 'prize'.";
  } else if (text.includes("sbi") || text.includes("rbi") || text.includes("bank") || text.includes("blocked")) {
    response = "Banks will never ask for your confidential information over a chat or call. If you've received such a message, it is likely a scam!";
  } else {
    response = "I am your ScamShield assistant. You can paste any suspicious message here and I'll analyze it for you, or ask me about common scam patterns!";
  }

  res.json({ response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Scam detection API running on port ${PORT}`);
});
