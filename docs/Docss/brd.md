BRD – BACKEND REQUIREMENTS DOCUMENT

System Name: AI Scam Shield Backend

1. Backend Overview

The backend provides detection services for SMS, email, and manual message scanning. It processes text input, runs the AI detection model, analyzes patterns, and returns a risk score.

2. Core Backend Components

AI Detection Engine
Processes text using pretrained NLP model to classify scam probability.

Pattern Analysis Engine
Identifies suspicious keywords, phishing phrases, and scam indicators.

Scam Number Reputation Database
Stores and checks reported scam phone numbers.

OCR Processing Service
Extracts text from uploaded screenshots.

3. API Endpoints

/detect-message
Input: message text
Output: scam probability + explanation

/check-number
Input: phone number
Output: scam reputation status

/scan-email
Input: email text
Output: phishing risk score

/scan-image
Input: image file
Process: OCR → text detection → analysis

4. Data Processing Flow

User Input
↓
Backend API
↓
AI Detection Model
↓
Pattern Analysis
↓
Risk Score Generated
↓
Response Sent to Frontend

5. Security Considerations

• Secure API communication
• Minimal storage of user data
• No sensitive financial data stored