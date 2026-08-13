import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { memoryBank } from './memoryBank.js';
import { agent } from './agent.js';
import { SAMPLE_DOCUMENTS } from './samples.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File Upload Config
const upload = multer({ storage: multer.memoryStorage() });

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Asynchronous Bureaucracy Buster Agent',
    version: '1.0.0',
    geminiModel: 'gemini-2.5-flash',
    cloudPlatform: 'Google Cloud Run'
  });
});

// Get sample documents
app.get('/api/samples', (req, res) => {
  res.json(SAMPLE_DOCUMENTS);
});

// Get all claims from Memory Bank
app.get('/api/claims', (req, res) => {
  const claims = memoryBank.getAllClaims();
  res.json(claims);
});

// Get single claim details
app.get('/api/claims/:id', (req, res) => {
  const claim = memoryBank.getClaim(req.params.id);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }
  res.json(claim);
});

// Ingest a document (file upload or sample document ID)
app.post('/api/claims/ingest', upload.single('file'), async (req, res) => {
  try {
    let docText = "";
    let fileName = "document.pdf";

    if (req.body.sampleId) {
      const sample = SAMPLE_DOCUMENTS.find(s => s.id === req.body.sampleId);
      if (!sample) return res.status(400).json({ error: 'Invalid sample ID' });
      docText = sample.content;
      fileName = sample.filename;
    } else if (req.file) {
      docText = req.file.buffer.toString('utf8'); // Handles text/raw files or text extracted from PDF
      fileName = req.file.originalname;
    } else if (req.body.rawText) {
      docText = req.body.rawText;
      fileName = "pasted_document.txt";
    } else {
      return res.status(400).json({ error: 'No file, sampleId, or rawText provided' });
    }

    const claim = await agent.analyzeDocument(docText, fileName);
    res.json({ success: true, claim });
  } catch (err) {
    console.error("Error ingesting claim:", err);
    res.status(500).json({ error: err.message });
  }
});

// Generate Appeal Letter for a claim
app.post('/api/claims/:id/generate-appeal', async (req, res) => {
  try {
    const claim = await agent.generateAppealLetter(req.params.id);
    res.json({ success: true, claim });
  } catch (err) {
    console.error("Error generating appeal:", err);
    res.status(500).json({ error: err.message });
  }
});

// Dispatch Appeal Letter
app.post('/api/claims/:id/dispatch-appeal', async (req, res) => {
  try {
    const recipient = req.body.recipient || "appeals@carrier-health.com";
    const claim = await agent.dispatchAppeal(req.params.id, recipient);
    res.json({ success: true, claim });
  } catch (err) {
    console.error("Error dispatching appeal:", err);
    res.status(500).json({ error: err.message });
  }
});

// Process carrier response (Simulated asynchronous background job)
app.post('/api/claims/:id/carrier-response', async (req, res) => {
  try {
    const { messageText, sender } = req.body;
    if (!messageText) return res.status(400).json({ error: 'messageText is required' });

    const result = await agent.handleCarrierResponse(req.params.id, messageText, sender);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Error processing carrier response:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete claim
app.delete('/api/claims/:id', (req, res) => {
  const deleted = memoryBank.deleteClaim(req.params.id);
  res.json({ success: deleted });
});

// System telemetry & Google Cloud Architecture Status
app.get('/api/system/telemetry', (req, res) => {
  const claims = memoryBank.getAllClaims();
  const totalClaims = claims.length;
  const activeAppeals = claims.filter(c => c.status === 'APPEAL_SENT' || c.status === 'AWAITING_CARRIER').length;
  const wonClaims = claims.filter(c => c.status === 'WON_RESOLVED').length;
  
  let totalBilledNum = 0;
  claims.forEach(c => {
    const val = parseFloat((c.billedAmount || '').replace(/[^0-9.]/g, ''));
    if (!isNaN(val)) totalBilledNum += val;
  });

  res.json({
    cloudRegion: 'us-central1 (Iowa)',
    serviceName: 'bureaucracy-buster-backend',
    runtimeContainer: 'Cloud Run (Managed Serverless)',
    memoryBankState: 'Persistent Memory Bank Active',
    telemetry: {
      totalClaimsIngested: totalClaims,
      activeAsyncAppeals: activeAppeals,
      wonClaims: wonClaims,
      totalDisputedValue: `$${totalBilledNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      agentModel: 'Gemini 3.5 Flash',
      agentFramework: 'Google GenAI SDK (@google/genai)',
      openTelemetryLogs: 'Enabled (Structured JSON Audits)'
    }
  });
});

// Serve frontend static build if available
const clientBuildPath = path.join(__dirname, '..', 'dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`
        <html>
          <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
            <h2>⚡ Bureaucracy Buster Backend Running</h2>
            <p>API is healthy at <code>http://localhost:${PORT}/api/health</code></p>
            <p>To run UI, launch Vite dev server or build frontend.</p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Bureaucracy Buster Agent Server Running on Port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/health`);
  console.log(`===================================================`);
});
