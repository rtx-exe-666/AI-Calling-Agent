# 🎓 College AI Call Agent

AI-powered phone agent for your college using **Twilio** + **Claude AI** (Anthropic).  
Handles inbound/outbound calls, converses intelligently, and logs all transcripts.

---

## 📁 Project Structure

```
ai-call-agent/
├── server.js          ← Express backend (Twilio webhooks + Claude AI)
├── package.json
├── .env.example       ← Copy to .env and fill in
└── frontend/
    └── src/
        └── App.jsx    ← React dashboard
```

---

## ⚡ Quick Setup

### 1. Install backend dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Fill in `.env`:
```
TWILIO_ACCOUNT_SID=ACa9a85cf555d5135688ad5522edf871bf
TWILIO_AUTH_TOKEN=<YOUR NEW TOKEN — rotate it now!>
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXX
BASE_URL=https://YOUR-NGROK-URL.ngrok.io
COLLEGE_NAME=Your College Name
PORT=3001
```

> ⚠️ **IMPORTANT**: Rotate your Twilio Auth Token at https://console.twilio.com before using!

### 3. Start the server
```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start
```

### 4. Expose server to internet (Twilio needs a public URL)
```bash
npx ngrok http 3001
```

Copy the ngrok HTTPS URL (e.g. `https://abc123.ngrok.io`) and:
- Update `BASE_URL` in your `.env`
- Restart the server

### 5. Configure Twilio Console
Go to: **Twilio Console → Phone Numbers → Your Number → Voice**

Set:
- **A CALL COMES IN** → Webhook → `https://YOUR-NGROK.ngrok.io/voice` → HTTP POST
- **Call Status Changes** → `https://YOUR-NGROK.ngrok.io/call-status` → HTTP POST

### 6. Set up the Frontend
```bash
cd frontend
npx create-react-app . --template cra-template
# Copy App.jsx into src/
npm start
```

Or use Vite:
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
# Copy App.jsx into src/
npm run dev
```

---

## 🤖 How It Works

```
Caller dials Twilio number
       ↓
Twilio sends POST to /voice
       ↓
Server returns TwiML (greeting + gather speech)
       ↓
Caller speaks → Twilio transcribes → POST to /gather
       ↓
Server sends transcript to Claude AI
       ↓
Claude responds with college info
       ↓
Server sends TwiML with AI response (Polly.Aditi voice)
       ↓
Loop continues until caller hangs up
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/voice` | Twilio incoming call webhook |
| POST | `/gather` | Process speech + Claude AI response |
| POST | `/outbound-voice` | Outbound call TwiML |
| POST | `/call-status` | Call status updates from Twilio |
| GET  | `/calls` | List all call logs |
| GET  | `/calls/:sid` | Get transcript for a call |
| POST | `/make-call` | Initiate outbound call |
| GET  | `/stats` | Dashboard statistics |

---

## 🔐 Security Notes

1. **Rotate Twilio Auth Token immediately** (it was shared insecurely)
2. Use `.env` file — never hardcode credentials
3. Add Twilio request validation in production:
   ```js
   const valid = twilio.validateRequest(authToken, sig, url, params);
   ```
4. Store call logs in a database (MongoDB/PostgreSQL) for production
5. Add rate limiting with `express-rate-limit`

---

## 🚀 Production Deployment

Deploy backend to:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`

Frontend can be deployed to Vercel/Netlify.  
Update `BASE_URL` in `.env` to your production domain.

---

## 📞 Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Create an account
3. Generate an API key under "API Keys"
