# 🛡️ The Asynchronous Bureaucracy Buster
> **Track:** The Taskmaster  
> **Built for:** All Things Agentic Hackathon  
> **Powered by:** Gemini 3.5 Flash, Google GenAI SDK (`@google/genai`), Google Cloud Run, and Firestore Memory Bank

---

## 📌 Problem & Value Proposition

Disputing denied insurance claims, out-of-network medical bills, and specialty drug step-therapy requirements is a frustrating, multi-step, weeks-long nightmare. Most AI applications today are simple chatbots that sit passively waiting for user questions.

**The Asynchronous Bureaucracy Buster** changes that. It is an autonomous background agent that takes scanned medical bills, identifies unlawful or arbitrary denial rationale, searches federal and state healthcare compliance mandates (such as the *No Surprises Act* and *ERISA Section 503*), drafts legally binding appeal letters, dispatches them, and monitors incoming carrier responses asynchronously over weeks without requiring manual user oversight.

---

## 🏗️ System Architecture & Google Cloud Integration

```
                                +-----------------------------------+
                                |     Scanned Medical Bill / PDF    |
                                +-----------------+-----------------+
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |      Express API / Cloud Run      |
                                +-----------------+-----------------+
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |      Gemini 3.5 Flash Model       |
                                |  (Google GenAI SDK @google/genai) |
                                +--------+----------------+---------+
                                         |                |
                       +-----------------+                +------------------+
                       |                                                     |
                       v                                                     v
+----------------------+----------------------+            +-----------------+-----------------+
|        Policy Research Knowledge Base       |            |    Persistent Cross-Session State    |
|   - No Surprises Act (45 CFR § 149.110)     |            |             MEMORY BANK             |
|   - ERISA Regulations (29 CFR § 2560.503-1) |            |  (Audit Trails & Reason Chains) |
|   - State Step-Therapy Mandates             |            +-----------------+-----------------+
+----------------------+----------------------+                              |
                       |                                                     v
                       v                                   +-----------------+-----------------+
+----------------------+----------------------+            |  Asynchronous Background Worker |
|   Formally Generated Legal Appeal Package   | ---------> |  (Cloud Scheduler / Carrier     |
+---------------------------------------------+            |   Response Event Machine)       |
                                                           +-----------------------------------+
```

### Google Cloud Infrastructure & Frameworks Used
- **Gemini Model:** `gemini-2.5-flash` / Gemini 3.5 Flash for rapid multimodal document ingestion, clinical reasoning, and legal letter generation.
- **Google Agent SDK:** Google GenAI SDK (`@google/genai`).
- **Google Cloud Run:** Fully managed serverless container hosting the Express API and background worker loop.
- **Memory Bank:** Persistent cross-session state store maintaining audit logs, reasoning chains, and case history.

---

## 🚀 Quick Spin-Up Instructions (Local & Cloud)

### Prerequisites
- Node.js 18+ installed
- Google Cloud account & Google AI Studio API Key (`GEMINI_API_KEY`)

### 1. Local Setup
```bash
# Clone repository
git clone https://github.com/your-username/asynchronous-bureaucracy-buster.git
cd asynchronous-bureaucracy-buster

# Install dependencies
npm install

# Setup environment variables (Optional but recommended for full Gemini live API calls)
# Create a .env file:
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Run in development mode (starts both Vite UI & Express server)
# Open two terminal tabs:

# Terminal 1: Backend Server (Port 3001)
npm start

# Terminal 2: Frontend Dashboard (Port 3000)
npm run dev
```

Navigate to `http://localhost:3000` in your web browser.

---

## 🎯 Demo Walkthrough for Judges

1. **Tab 1: Ingest Claim Document**
   - Click any of the pre-packaged sample claims (e.g. *Out-of-Network Emergency Room Fee Denial* or *Diagnostic Lumbar Spine MRI Denial*) or upload your own PDF.
   - Watch Gemini 3.5 Flash autonomously extract key parameters (Claim ID, Member ID, Denied Amount, Denial Code) and search the policy database for binding legal mandates.

2. **Tab 2: Case Memory Bank**
   - View the active case record, policy citations, and reasoning chain.
   - Click **Generate Appeal with Gemini 3.5** to draft a formal, legally backed Level 1 Appeal Letter.
   - Click **Dispatch Appeal Email** to initiate the asynchronous background tracking loop.

3. **Tab 3: Async Carrier Simulator**
   - Test background event handling by simulating an inbound carrier response (e.g., *Claim Approved & Overturned* or *Request Additional Info*).
   - Observe how the agent autonomously updates the case status, logs audit events, and determines next actions.

4. **Tab 4: GCP Architecture & Telemetry**
   - Inspect live OpenTelemetry-compliant JSON logs, system metrics, and disputed dollar totals.

---

## 📜 License
MIT License. Built for the All Things Agentic Hackathon 2026.
