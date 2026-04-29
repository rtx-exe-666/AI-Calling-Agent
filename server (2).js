require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const cors = require("cors");
const bodyParser = require("body-parser");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ─── Twilio & Anthropic clients ───────────────────────────────────────────────
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client     = twilio(accountSid, authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;
const anthropic  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── In-memory store (replace with DB for production) ────────────────────────
const conversations = {}; // callSid → message array
const callLogs      = []; // list of call records

// ─── College AI system prompt ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an AI phone assistant for ${process.env.COLLEGE_NAME || "Our College"}. 
You assist callers with:
- Admission inquiries (eligibility, process, deadlines, documents)
- Courses and curriculum information
- Fee structure, scholarships, and payment
- Campus facilities, hostel, and transport
- Academic calendar, exam schedules, results
- Department contacts and office hours
- Events, cultural fests, placements

Guidelines:
- Be warm, professional, and concise (under 80 words per response — this is a phone call).
- Speak naturally as if talking on the phone — no bullet points.
- If you cannot help, say: "Let me connect you with our office. Please hold." then include [TRANSFER] at the end.
- Say goodbye warmly if the caller seems done.
- Respond in the caller's language if possible (Hindi/English).`;

// ─── Helper: log transcript entry ─────────────────────────────────────────────
function addTranscript(callSid, role, text) {
  const log = callLogs.find((l) => l.id === callSid);
  if (log) log.transcript.push({ role, text, time: new Date().toISOString() });
}

// ─── WEBHOOK: Incoming call ────────────────────────────────────────────────────
app.post("/voice", (req, res) => {
  const { CallSid, From, To } = req.body;

  conversations[CallSid] = [];
  callLogs.unshift({
    id:        CallSid,
    from:      From,
    to:        To,
    direction: "inbound",
    startTime: new Date().toISOString(),
    status:    "in-progress",
    transcript: [],
  });

  const twiml  = new VoiceResponse();
  const gather = twiml.gather({
    input:         "speech",
    action:        `${process.env.BASE_URL}/gather`,
    method:        "POST",
    speechTimeout: "auto",
    language:      "en-IN",
  });

  const greeting = `Hello! Welcome to ${process.env.COLLEGE_NAME || "Our College"}. I'm your AI assistant. How can I help you today?`;
  gather.say({ voice: "Polly.Aditi" }, greeting);
  addTranscript(CallSid, "assistant", greeting);

  twiml.redirect(`${process.env.BASE_URL}/voice`);
  res.type("text/xml").send(twiml.toString());
});

// ─── WEBHOOK: Process caller speech ───────────────────────────────────────────
app.post("/gather", async (req, res) => {
  const { CallSid, SpeechResult } = req.body;
  const twiml = new VoiceResponse();

  if (!SpeechResult) {
    const g = twiml.gather({ input: "speech", action: `${process.env.BASE_URL}/gather`, method: "POST", speechTimeout: "auto", language: "en-IN" });
    g.say({ voice: "Polly.Aditi" }, "I didn't catch that. Could you please repeat?");
    return res.type("text/xml").send(twiml.toString());
  }

  addTranscript(CallSid, "user", SpeechResult);
  if (!conversations[CallSid]) conversations[CallSid] = [];
  conversations[CallSid].push({ role: "user", content: SpeechResult });

  try {
    const aiRes = await anthropic.messages.create({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 300,
      system:     SYSTEM_PROMPT,
      messages:   conversations[CallSid],
    });

    let reply = aiRes.content[0].text;
    const transfer = reply.includes("[TRANSFER]");
    reply = reply.replace("[TRANSFER]", "").trim();

    conversations[CallSid].push({ role: "assistant", content: reply });
    addTranscript(CallSid, "assistant", reply);

    if (transfer) {
      twiml.say({ voice: "Polly.Aditi" }, reply);
      twiml.dial(process.env.TRANSFER_NUMBER || "+911234567890");
    } else {
      const g = twiml.gather({ input: "speech", action: `${process.env.BASE_URL}/gather`, method: "POST", speechTimeout: "auto", language: "en-IN" });
      g.say({ voice: "Polly.Aditi" }, reply);
    }
  } catch (err) {
    console.error("Claude error:", err.message);
    const g = twiml.gather({ input: "speech", action: `${process.env.BASE_URL}/gather`, method: "POST", speechTimeout: "auto" });
    g.say({ voice: "Polly.Aditi" }, "I'm sorry, I'm having trouble right now. Please try again.");
  }

  res.type("text/xml").send(twiml.toString());
});

// ─── WEBHOOK: Outbound call voice handler ─────────────────────────────────────
app.post("/outbound-voice", (req, res) => {
  const { CallSid, message } = req.body;
  const msg = message || req.query.message || "Hello, this is a call from the college.";

  conversations[CallSid] = [];
  const twiml  = new VoiceResponse();
  const gather = twiml.gather({
    input:         "speech",
    action:        `${process.env.BASE_URL}/gather`,
    method:        "POST",
    speechTimeout: "auto",
    language:      "en-IN",
  });
  gather.say({ voice: "Polly.Aditi" }, msg);
  addTranscript(CallSid, "assistant", msg);

  res.type("text/xml").send(twiml.toString());
});

// ─── WEBHOOK: Call status updates ─────────────────────────────────────────────
app.post("/call-status", (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  const log = callLogs.find((l) => l.id === CallSid);
  if (log) {
    log.status   = CallStatus;
    log.duration = CallDuration ? parseInt(CallDuration) : null;
    if (CallStatus === "completed") log.endTime = new Date().toISOString();
  }
  res.sendStatus(200);
});

// ─── REST API: Get all call logs ───────────────────────────────────────────────
app.get("/calls", (req, res) => res.json(callLogs));

// ─── REST API: Get single call transcript ────────────────────────────────────
app.get("/calls/:sid", (req, res) => {
  const log = callLogs.find((l) => l.id === req.params.sid);
  if (!log) return res.status(404).json({ error: "Not found" });
  res.json(log);
});

// ─── REST API: Make outbound call ────────────────────────────────────────────
app.post("/make-call", async (req, res) => {
  const { to, message } = req.body;
  if (!to) return res.status(400).json({ error: "Phone number required" });

  try {
    const call = await client.calls.create({
      url:            `${process.env.BASE_URL}/outbound-voice?message=${encodeURIComponent(message || `Hello, this is an automated call from ${process.env.COLLEGE_NAME || "the college"}.`)}`,
      to,
      from:           process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.BASE_URL}/call-status`,
      statusCallbackMethod: "POST",
    });

    callLogs.unshift({
      id:        call.sid,
      from:      process.env.TWILIO_PHONE_NUMBER,
      to,
      direction: "outbound",
      startTime: new Date().toISOString(),
      status:    "initiated",
      transcript: [{ role: "assistant", text: message, time: new Date().toISOString() }],
    });

    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API: Dashboard stats ────────────────────────────────────────────────
app.get("/stats", (req, res) => {
  const total    = callLogs.length;
  const active   = callLogs.filter((c) => c.status === "in-progress").length;
  const today    = callLogs.filter((c) => c.startTime?.startsWith(new Date().toISOString().split("T")[0])).length;
  const avgDur   = callLogs.filter((c) => c.duration).reduce((a, b) => a + b.duration, 0) / (callLogs.filter((c) => c.duration).length || 1);
  res.json({ total, active, today, avgDuration: Math.round(avgDur) });
});

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🎓 College AI Call Agent running on port ${PORT}`);
  console.log(`📞 Twilio webhook URL: ${process.env.BASE_URL}/voice`);
});
