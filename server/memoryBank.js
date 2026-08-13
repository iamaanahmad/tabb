import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'memory_bank.json');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class MemoryBank {
  constructor() {
    this.claims = this._loadData();
  }

  _loadData() {
    if (!fs.existsSync(DB_PATH)) {
      return {};
    }
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error loading memory bank database:', e);
      return {};
    }
  }

  _saveData() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.claims, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving memory bank database:', e);
    }
  }

  getAllClaims() {
    return Object.values(this.claims).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getClaim(id) {
    return this.claims[id] || null;
  }

  saveClaim(claim) {
    const now = new Date().toISOString();
    if (!this.claims[claim.id]) {
      claim.createdAt = now;
      claim.history = claim.history || [];
      claim.communications = claim.communications || [];
      claim.auditTrail = claim.auditTrail || [];
    }
    claim.updatedAt = now;
    this.claims[claim.id] = claim;
    this._saveData();
    return claim;
  }

  addAuditLog(claimId, action, details, actor = 'Agent-Gemini-3.5') {
    const claim = this.getClaim(claimId);
    if (!claim) return null;

    const logEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      actor,
      action,
      details
    };

    claim.auditTrail.push(logEntry);
    claim.updatedAt = new Date().toISOString();
    this.saveClaim(claim);
    return logEntry;
  }

  addCommunication(claimId, direction, subject, body, sender, recipient) {
    const claim = this.getClaim(claimId);
    if (!claim) return null;

    const commEntry = {
      id: 'comm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      direction, // 'OUTBOUND' | 'INBOUND'
      subject,
      body,
      sender,
      recipient
    };

    claim.communications.push(commEntry);
    claim.updatedAt = new Date().toISOString();
    this.saveClaim(claim);
    return commEntry;
  }

  updateState(claimId, newState, reason) {
    const claim = this.getClaim(claimId);
    if (!claim) return null;

    const oldState = claim.status;
    claim.status = newState;
    this.addAuditLog(claimId, 'STATE_CHANGE', { oldState, newState, reason });
    return this.saveClaim(claim);
  }

  deleteClaim(id) {
    if (this.claims[id]) {
      delete this.claims[id];
      this._saveData();
      return true;
    }
    return false;
  }
}

export const memoryBank = new MemoryBank();
