import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:3001";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0a0e1a; color: #e2e8f0; font-family: 'DM Sans', sans-serif; min-height: 100vh; }

  :root {
    --bg-0: #0a0e1a;
    --bg-1: #0f1526;
    --bg-2: #161d35;
    --bg-3: #1e2744;
    --accent: #f5a623;
    --accent2: #4f8ef7;
    --success: #22d3a0;
    --danger: #f87171;
    --border: rgba(255,255,255,0.07);
    --text-1: #e2e8f0;
    --text-2: #94a3b8;
    --text-3: #64748b;
    --font-head: 'Space Grotesk', sans-serif;
  }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

  .topbar {
    background: var(--bg-1);
    border-bottom: 1px solid var(--border);
    padding: 0 28px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-head);
    font-weight: 700;
    font-size: 17px;
    letter-spacing: -0.3px;
  }

  .logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--accent), #e0850f);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }

  .status-pill {
    display: flex; align-items: center; gap: 6px;
    background: rgba(34, 211, 160, 0.1);
    border: 1px solid rgba(34, 211, 160, 0.25);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    color: var(--success);
    font-weight: 500;
  }

  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--success); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  .main { display: flex; flex: 1; }

  .sidebar {
    width: 220px;
    background: var(--bg-1);
    border-right: 1px solid var(--border);
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    font-size: 13.5px;
    color: var(--text-2);
    cursor: pointer;
    border-radius: 0;
    transition: all 0.15s;
    border-left: 3px solid transparent;
  }

  .nav-item:hover { background: var(--bg-2); color: var(--text-1); }
  .nav-item.active { background: rgba(245,166,35,0.08); color: var(--accent); border-left-color: var(--accent); }

  .nav-icon { font-size: 15px; width: 18px; text-align: center; }

  .content { flex: 1; padding: 28px; overflow: auto; background: var(--bg-0); }

  .section-title {
    font-family: var(--font-head);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 24px;
    letter-spacing: -0.4px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
  }

  .stat-label { font-size: 11.5px; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .stat-value { font-family: var(--font-head); font-size: 30px; font-weight: 700; color: var(--text-1); line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--text-3); margin-top: 4px; }
  .stat-accent { color: var(--accent); }
  .stat-success { color: var(--success); }
  .stat-blue { color: var(--accent2); }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .card {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 22px;
  }

  .card-title {
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-icon { font-size: 15px; }

  .form-group { margin-bottom: 14px; }

  .form-label { font-size: 12px; color: var(--text-2); margin-bottom: 6px; display: block; font-weight: 500; }

  .form-input, .form-textarea, .form-select {
    width: 100%;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 13px;
    color: var(--text-1);
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.15s;
  }

  .form-input:focus, .form-textarea:focus { border-color: rgba(245,166,35,0.4); }
  .form-textarea { resize: vertical; min-height: 80px; }

  .btn {
    width: 100%;
    padding: 11px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    font-size: 13.5px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }

  .btn-primary {
    background: var(--accent);
    color: #0a0e1a;
  }

  .btn-primary:hover { background: #e0950f; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .btn-danger { background: rgba(248,113,113,0.15); color: var(--danger); border: 1px solid rgba(248,113,113,0.25); }
  .btn-danger:hover { background: rgba(248,113,113,0.25); }

  .call-list { display: flex; flex-direction: column; gap: 10px; }

  .call-item {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 13px 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .call-item:hover { border-color: rgba(255,255,255,0.14); background: var(--bg-3); }

  .call-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .avatar-in { background: rgba(79,142,247,0.15); color: var(--accent2); }
  .avatar-out { background: rgba(245,166,35,0.15); color: var(--accent); }

  .call-info { flex: 1; min-width: 0; }
  .call-from { font-size: 13px; font-weight: 500; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .call-time { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  .badge {
    font-size: 10.5px;
    padding: 3px 8px;
    border-radius: 20px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .badge-active { background: rgba(34,211,160,0.12); color: var(--success); border: 1px solid rgba(34,211,160,0.2); }
  .badge-completed { background: var(--bg-3); color: var(--text-3); }
  .badge-initiated { background: rgba(79,142,247,0.12); color: var(--accent2); }
  .badge-failed { background: rgba(248,113,113,0.12); color: var(--danger); }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--text-3);
    font-size: 13px;
  }

  .empty-icon { font-size: 30px; margin-bottom: 8px; opacity: 0.4; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
    padding: 20px;
  }

  .modal {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 540px;
    max-height: 75vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 20px 22px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title { font-family: var(--font-head); font-size: 16px; font-weight: 600; color: var(--text-1); }
  .modal-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; }

  .modal-close {
    width: 30px; height: 30px;
    border-radius: 6px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
  }

  .transcript-body { flex: 1; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 12px; }

  .msg { display: flex; flex-direction: column; max-width: 85%; }
  .msg.ai { align-self: flex-start; }
  .msg.user { align-self: flex-end; }

  .msg-label { font-size: 10px; color: var(--text-3); margin-bottom: 4px; font-weight: 500; }
  .msg.user .msg-label { text-align: right; }

  .msg-bubble {
    border-radius: 12px;
    padding: 10px 13px;
    font-size: 13px;
    line-height: 1.55;
  }

  .msg.ai .msg-bubble { background: var(--bg-2); color: var(--text-1); border-radius: 4px 12px 12px 12px; }
  .msg.user .msg-bubble { background: rgba(245,166,35,0.15); color: #f5c97a; border: 1px solid rgba(245,166,35,0.2); border-radius: 12px 4px 12px 12px; }

  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 13px;
    color: var(--text-1);
    z-index: 300;
    animation: slideIn 0.2s ease;
    max-width: 300px;
  }

  @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .toast.success { border-color: rgba(34,211,160,0.3); }
  .toast.error { border-color: rgba(248,113,113,0.3); }

  .loading-bar {
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    border-radius: 2px;
    animation: shimmer 1.5s infinite;
    margin-bottom: 20px;
  }
  @keyframes shimmer { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }
`;

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDuration(s) {
  if (!s) return "--";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, today: 0, avgDuration: 0 });
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [calling, setCalling] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collegeName, setCollegeName] = useState("College AI Agent");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const [cRes, sRes] = await Promise.all([fetch(`${API}/calls`), fetch(`${API}/stats`)]);
      if (cRes.ok) setCalls(await cRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch {
      // backend not running — show demo data
      setCalls([
        { id: "CA123", from: "+917890123456", to: "+918001234567", direction: "inbound", startTime: new Date(Date.now() - 300000).toISOString(), status: "completed", duration: 142, transcript: [{ role: "assistant", text: "Hello! Welcome to Our College. How can I help you today?" }, { role: "user", text: "I want to know about admission process for B.Tech." }, { role: "assistant", text: "B.Tech admissions are based on JEE scores. The cutoff last year was 85 percentile. You'll need Class 12 with PCM. Application deadline is June 30th. Shall I share the fee structure too?" }, { role: "user", text: "Yes please" }, { role: "assistant", text: "The annual fee is 1.8 lakhs per year with hostel facility available at 60,000 per annum. We offer merit scholarships up to 50% for top rankers." }] },
        { id: "CA124", from: "+919876543210", direction: "outbound", startTime: new Date(Date.now() - 120000).toISOString(), status: "in-progress", transcript: [{ role: "assistant", text: "Hello, this is an automated reminder about your fee payment due date." }] },
        { id: "CA125", from: "+911234567890", direction: "inbound", startTime: new Date(Date.now() - 60000).toISOString(), status: "in-progress", transcript: [{ role: "assistant", text: "Hello! Welcome to Our College. How can I help you today?" }, { role: "user", text: "What are the hostel facilities?" }] },
      ]);
      setStats({ total: 247, active: 2, today: 18, avgDuration: 185 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const makeCall = async () => {
    if (!phone.trim()) return showToast("Enter a phone number", "error");
    setCalling(true);
    try {
      const res = await fetch(`${API}/make-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Call initiated! SID: ${data.callSid?.slice(-8)}`);
        setPhone(""); setMessage("");
        fetchData();
      } else {
        showToast(data.error || "Call failed", "error");
      }
    } catch {
      showToast("Cannot reach backend. Is server running?", "error");
    } finally {
      setCalling(false);
    }
  };

  const activeCalls = calls.filter((c) => c.status === "in-progress" || c.status === "initiated");
  const recentCalls = calls.slice(0, 20);

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* Top bar */}
        <div className="topbar">
          <div className="logo">
            <div className="logo-icon">📞</div>
            {collegeName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="status-pill">
              <div className="dot" />
              Agent Online
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              Powered by Claude AI + Twilio
            </div>
          </div>
        </div>

        <div className="main">
          {/* Sidebar */}
          <div className="sidebar">
            {[
              { id: "dashboard", icon: "⊞", label: "Dashboard" },
              { id: "calls", icon: "📋", label: "Call Logs" },
              { id: "outbound", icon: "📤", label: "Make a Call" },
              { id: "settings", icon: "⚙", label: "Settings" },
            ].map((n) => (
              <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.6 }}>
                <div style={{ color: "var(--text-2)", fontWeight: 500, marginBottom: 4 }}>Webhook URLs</div>
                <div>Inbound: /voice</div>
                <div>Status: /call-status</div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="content">
            {loading && <div className="loading-bar" />}

            {/* ── Dashboard ── */}
            {tab === "dashboard" && (
              <>
                <div className="section-title">Dashboard</div>

                {/* Stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Total Calls</div>
                    <div className="stat-value stat-accent">{stats.total}</div>
                    <div className="stat-sub">All time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Active Now</div>
                    <div className="stat-value stat-success">{stats.active}</div>
                    <div className="stat-sub">Live calls</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Today</div>
                    <div className="stat-value stat-blue">{stats.today}</div>
                    <div className="stat-sub">Calls today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Avg Duration</div>
                    <div className="stat-value">{formatDuration(stats.avgDuration)}</div>
                    <div className="stat-sub">Per call</div>
                  </div>
                </div>

                <div className="grid-2">
                  {/* Active calls */}
                  <div className="card">
                    <div className="card-title">
                      <span className="card-icon">🔴</span>
                      Active Calls
                      {activeCalls.length > 0 && (
                        <span className="badge badge-active" style={{ marginLeft: "auto" }}>{activeCalls.length} live</span>
                      )}
                    </div>
                    {activeCalls.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📵</div>
                        No active calls
                      </div>
                    ) : (
                      <div className="call-list">
                        {activeCalls.map((c) => (
                          <div key={c.id} className="call-item" onClick={() => setSelectedCall(c)}>
                            <div className={`call-avatar ${c.direction === "inbound" ? "avatar-in" : "avatar-out"}`}>
                              {c.direction === "inbound" ? "↙" : "↗"}
                            </div>
                            <div className="call-info">
                              <div className="call-from">{c.from || "Unknown"}</div>
                              <div className="call-time">{timeAgo(c.startTime)}</div>
                            </div>
                            <span className="badge badge-active">Live</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick call */}
                  <div className="card">
                    <div className="card-title">
                      <span className="card-icon">📤</span>
                      Quick Outbound Call
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number (with country code)</label>
                      <input className="form-input" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Opening Message (optional)</label>
                      <textarea className="form-textarea" placeholder="Hello, this is an automated call from the college regarding..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={makeCall} disabled={calling}>
                      {calling ? "Calling..." : "📞 Initiate Call"}
                    </button>
                  </div>
                </div>

                {/* Recent calls */}
                <div className="card">
                  <div className="card-title">
                    <span className="card-icon">🕐</span>
                    Recent Calls
                  </div>
                  {recentCalls.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📂</div>
                      No calls yet. Configure Twilio webhook to start receiving calls.
                    </div>
                  ) : (
                    <div className="call-list">
                      {recentCalls.map((c) => (
                        <div key={c.id} className="call-item" onClick={() => setSelectedCall(c)}>
                          <div className={`call-avatar ${c.direction === "inbound" ? "avatar-in" : "avatar-out"}`}>
                            {c.direction === "inbound" ? "↙" : "↗"}
                          </div>
                          <div className="call-info">
                            <div className="call-from">{c.direction === "inbound" ? c.from : c.to}</div>
                            <div className="call-time">{timeAgo(c.startTime)} · {c.direction} · {formatDuration(c.duration)}</div>
                          </div>
                          <span className={`badge badge-${c.status}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── All Calls ── */}
            {tab === "calls" && (
              <>
                <div className="section-title">Call Logs</div>
                <div className="card">
                  {calls.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      No calls recorded yet
                    </div>
                  ) : (
                    <div className="call-list">
                      {calls.map((c) => (
                        <div key={c.id} className="call-item" onClick={() => setSelectedCall(c)}>
                          <div className={`call-avatar ${c.direction === "inbound" ? "avatar-in" : "avatar-out"}`}>
                            {c.direction === "inbound" ? "↙" : "↗"}
                          </div>
                          <div className="call-info">
                            <div className="call-from">{c.direction === "inbound" ? c.from : c.to}</div>
                            <div className="call-time">
                              {new Date(c.startTime).toLocaleString("en-IN")} · {formatDuration(c.duration)} · {c.transcript?.length || 0} messages
                            </div>
                          </div>
                          <span className={`badge badge-${c.status}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Make a Call ── */}
            {tab === "outbound" && (
              <>
                <div className="section-title">Make an Outbound Call</div>
                <div className="card" style={{ maxWidth: 500 }}>
                  <div className="card-title">
                    <span className="card-icon">📤</span>
                    Outbound Call Setup
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipient Phone Number</label>
                    <input className="form-input" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Opening Message</label>
                    <textarea className="form-textarea" style={{ minHeight: 110 }} placeholder="Hello! This is an automated call from [College Name]. We're calling to inform you about..." value={message} onChange={(e) => setMessage(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: 14, padding: "10px 14px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)", borderRadius: 8, fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>
                    💡 After the opening message, the call switches to <strong style={{ color: "var(--accent2)" }}>AI conversation mode</strong> — the recipient can ask questions and Claude will respond intelligently.
                  </div>
                  <button className="btn btn-primary" onClick={makeCall} disabled={calling}>
                    {calling ? "⏳ Initiating Call..." : "📞 Place Call Now"}
                  </button>
                </div>
              </>
            )}

            {/* ── Settings ── */}
            {tab === "settings" && (
              <>
                <div className="section-title">Settings & Setup</div>
                <div className="grid-2">
                  <div className="card">
                    <div className="card-title">⚙ Configuration</div>
                    <div className="form-group">
                      <label className="form-label">College Name</label>
                      <input className="form-input" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Backend API URL</label>
                      <input className="form-input" defaultValue={API} readOnly style={{ opacity: 0.6 }} />
                    </div>
                    <button className="btn btn-primary" onClick={() => showToast("Settings saved!")}>Save Settings</button>
                  </div>

                  <div className="card">
                    <div className="card-title">🔧 Twilio Webhook Setup</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.8 }}>
                      <div style={{ marginBottom: 12 }}>Configure these URLs in your <a href="https://console.twilio.com" target="_blank" style={{ color: "var(--accent2)" }}>Twilio Console</a>:</div>
                      {[
                        { label: "Incoming Voice Webhook", url: "http://localhost:3001/voice", method: "HTTP POST" },
                        { label: "Call Status Callback", url: "http://localhost:3001/call-status", method: "HTTP POST" },
                      ].map((w) => (
                        <div key={w.label} style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", marginBottom: 10 }}>
                          <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 3 }}>{w.label} · {w.method}</div>
                          <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{w.url.replace("localhost:3001", "YOUR-NGROK-URL.ngrok.io")}</div>
                        </div>
                      ))}
                      <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>
                        Use <code style={{ background: "var(--bg-3)", padding: "1px 5px", borderRadius: 4 }}>npx ngrok http 3001</code> to expose locally
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-title">🚀 Quick Start Guide</div>
                  {[
                    { step: "1", title: "Install dependencies", cmd: "cd ai-call-agent && npm install" },
                    { step: "2", title: "Copy and fill .env", cmd: "cp .env.example .env  # Fill in your keys" },
                    { step: "3", title: "Start the server", cmd: "npm run dev" },
                    { step: "4", title: "Expose with ngrok", cmd: "npx ngrok http 3001" },
                    { step: "5", title: "Set Twilio webhook", cmd: "https://YOUR-NGROK.ngrok.io/voice → Twilio Console" },
                  ].map((s) => (
                    <div key={s.step} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ width: 24, height: 24, background: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#0a0e1a", flexShrink: 0 }}>{s.step}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 3 }}>{s.title}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 12, background: "var(--bg-2)", padding: "5px 9px", borderRadius: 6, color: "var(--success)" }}>{s.cmd}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Transcript Modal */}
        {selectedCall && (
          <div className="modal-overlay" onClick={() => setSelectedCall(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div className="modal-title">Call Transcript</div>
                  <div className="modal-sub">
                    {selectedCall.from || selectedCall.to} · {new Date(selectedCall.startTime).toLocaleString("en-IN")} · {formatDuration(selectedCall.duration)}
                  </div>
                </div>
                <button className="modal-close" onClick={() => setSelectedCall(null)}>✕</button>
              </div>
              <div className="transcript-body">
                {(!selectedCall.transcript || selectedCall.transcript.length === 0) ? (
                  <div className="empty-state">No transcript available</div>
                ) : (
                  selectedCall.transcript.map((m, i) => (
                    <div key={i} className={`msg ${m.role === "user" ? "user" : "ai"}`}>
                      <div className="msg-label">{m.role === "user" ? "Caller" : "AI Agent"}</div>
                      <div className="msg-bubble">{m.text}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" ? "✓ " : "✗ "}{toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
