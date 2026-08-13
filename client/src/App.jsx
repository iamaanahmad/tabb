import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('memory'); // 'intake' | 'memory' | 'simulator' | 'telemetry'
  const [samples, setSamples] = useState([]);
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [telemetry, setTelemetry] = useState(null);

  // Form states
  const [rawText, setRawText] = useState('');
  const [simulatorCarrierMsg, setSimulatorCarrierMsg] = useState('');
  const [customRecipient, setCustomRecipient] = useState('appeals@carrier-health.com');

  useEffect(() => {
    fetchSamples();
    fetchClaims();
    fetchTelemetry();
  }, []);

  const fetchSamples = async () => {
    try {
      const res = await fetch('/api/samples');
      const data = await res.json();
      setSamples(data);
    } catch (err) {
      console.error('Error fetching samples:', err);
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims');
      const data = await res.json();
      setClaims(data);
      if (data.length > 0 && !selectedClaim) {
        setSelectedClaim(data[0]);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    }
  };

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/system/telemetry');
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    }
  };

  const handleIngestSample = async (sampleId) => {
    setLoading(true);
    setStatusMsg('Ingesting sample document & invoking Gemini 3.5 Flash...');
    try {
      const res = await fetch('/api/claims/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Claim successfully parsed and legal grounds identified!');
        await fetchClaims();
        setSelectedClaim(data.claim);
        setActiveTab('memory');
      } else {
        alert('Ingest failed: ' + data.error);
      }
    } catch (err) {
      alert('Error ingesting document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestRawText = async () => {
    if (!rawText.trim()) return alert('Please enter claim document text');
    setLoading(true);
    setStatusMsg('Parsing uploaded text & searching policy knowledge base...');
    try {
      const res = await fetch('/api/claims/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Claim analyzed successfully!');
        setRawText('');
        await fetchClaims();
        setSelectedClaim(data.claim);
        setActiveTab('memory');
      } else {
        alert('Ingest failed: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setStatusMsg(`Uploading ${file.name} to agent...`);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/claims/ingest', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('File ingested and parsed by agent!');
        await fetchClaims();
        setSelectedClaim(data.claim);
        setActiveTab('memory');
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAppeal = async (claimId) => {
    setLoading(true);
    setStatusMsg('Gemini 3.5 drafting formal legal & clinical appeal letter...');
    try {
      const res = await fetch(`/api/claims/${claimId}/generate-appeal`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Appeal letter drafted!');
        await fetchClaims();
        setSelectedClaim(data.claim);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchAppeal = async (claimId) => {
    setLoading(true);
    setStatusMsg('Transmitting formal appeal to insurance carrier...');
    try {
      const res = await fetch(`/api/claims/${claimId}/dispatch-appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: customRecipient })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Appeal package dispatched! Asynchronous timer running.');
        await fetchClaims();
        setSelectedClaim(data.claim);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCarrierReply = async () => {
    if (!selectedClaim) return alert('Select an active claim first');
    if (!simulatorCarrierMsg.trim()) return alert('Enter a simulated response message');

    setLoading(true);
    setStatusMsg('Agent receiving async carrier response & evaluating state machine...');
    try {
      const res = await fetch(`/api/claims/${selectedClaim.id}/carrier-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: simulatorCarrierMsg, sender: 'carrier-claims-bot@healthplan.com' })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Carrier response processed: ${data.result.analysis.outcome}`);
        setSimulatorCarrierMsg('');
        await fetchClaims();
        setSelectedClaim(data.result.claim);
        fetchTelemetry();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClaim = async (id) => {
    if (!confirm('Are you sure you want to delete this claim case?')) return;
    try {
      await fetch(`/api/claims/${id}`, { method: 'DELETE' });
      await fetchClaims();
      setSelectedClaim(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="header-bar">
        <div className="brand-title">
          <div className="brand-icon">🛡️</div>
          <div>
            <h1 className="brand-name">Asynchronous Bureaucracy Buster</h1>
            <span className="track-badge">Track: The Taskmaster</span>
          </div>
        </div>

        <div className="header-status">
          <div className="status-pill">
            <span className="pulse-dot"></span>
            <span>Gemini 3.5 Flash Agent Online</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'intake' ? 'active' : ''}`}
          onClick={() => setActiveTab('intake')}
        >
          📥 Ingest Claim Document
        </button>
        <button 
          className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`}
          onClick={() => setActiveTab('memory')}
        >
          🗂️ Case Memory Bank ({claims.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          ⚡ Async Carrier Simulator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => { setActiveTab('telemetry'); fetchTelemetry(); }}
        >
          ☁️ GCP Architecture & Telemetry
        </button>
      </nav>

      {/* Loading & Status Banner */}
      {loading && (
        <div className="glass-card" style={{ marginBottom: '20px', borderColor: 'var(--primary-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontWeight: '600', color: 'var(--primary-cyan)' }}>{statusMsg}</span>
          </div>
        </div>
      )}

      {/* --- TAB 1: INGEST CLAIM DOCUMENT --- */}
      {activeTab === 'intake' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Demo Pre-loaded Samples */}
          <div className="glass-card">
            <div className="card-header">
              <h2 className="card-title">🚀 Fast Demo: Select a Sample Medical Bill / Denial</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click any sample to trigger agent parsing instantly</span>
            </div>
            <div className="sample-grid">
              {samples.map((sample) => (
                <div 
                  key={sample.id} 
                  className="sample-item"
                  onClick={() => handleIngestSample(sample.id)}
                >
                  <span className="sample-tag">{sample.category}</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '4px 0' }}>{sample.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sample.filename}</p>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                    Process with Gemini 3.5 →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Upload or Paste */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* File Upload */}
            <div className="glass-card">
              <div className="card-header">
                <h3 className="card-title">📁 Upload Medical Document</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Upload a scanned bill, denial notice, or explanation of benefits (PDF / Text).
              </p>
              <input 
                type="file" 
                onChange={handleFileUpload}
                style={{ 
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px dashed var(--border-glow)',
                  borderRadius: '10px',
                  color: 'var(--text-muted)'
                }} 
              />
            </div>

            {/* Paste Raw Document Text */}
            <div className="glass-card">
              <div className="card-header">
                <h3 className="card-title">📝 Paste Denial Letter Text</h3>
              </div>
              <textarea 
                rows="4" 
                placeholder="Paste insurance denial text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#fff',
                  fontFamily: 'var(--font-code)',
                  fontSize: '0.85rem',
                  marginBottom: '12px'
                }}
              />
              <button className="btn btn-primary" onClick={handleIngestRawText} style={{ width: '100%' }}>
                Ingest & Analyze Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CASE MEMORY BANK --- */}
      {activeTab === 'memory' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Claims Sidebar */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3 className="card-title" style={{ marginBottom: '14px' }}>Active Cases ({claims.length})</h3>
            {claims.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No active claims. Ingest a document in Tab 1 to get started!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {claims.map((claim) => (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: selectedClaim?.id === claim.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.8)',
                      border: selectedClaim?.id === claim.id ? '1px solid var(--primary-cyan)' : '1px solid #1e293b',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{claim.patientName}</strong>
                      <span className={`badge badge-${claim.status}`}>{claim.status}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Ref: {claim.claimRef} • {claim.deniedAmount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Claim Detail View */}
          {selectedClaim ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Info */}
              <div className="glass-card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">{selectedClaim.patientName} — {selectedClaim.carrier}</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Claim Ref: {selectedClaim.claimRef} | Member ID: {selectedClaim.memberId} | Category: {selectedClaim.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className={`badge badge-${selectedClaim.status}`}>{selectedClaim.status}</span>
                    <button 
                      onClick={() => handleDeleteClaim(selectedClaim.id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)', fontSize: '1rem' }}
                      title="Delete Case"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Claim Highlights */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '8px' }}>
                    <span className="metric-lbl">Provider</span>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedClaim.provider}</div>
                  </div>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '8px' }}>
                    <span className="metric-lbl">Service Date</span>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{selectedClaim.dateOfService}</div>
                  </div>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '8px' }}>
                    <span className="metric-lbl">Disputed Amount</span>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-rose)' }}>{selectedClaim.deniedAmount}</div>
                  </div>
                  <div style={{ background: '#020617', padding: '10px', borderRadius: '8px' }}>
                    <span className="metric-lbl">Denial Code</span>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-amber)' }}>{selectedClaim.denialReasonCode}</div>
                  </div>
                </div>

                {/* Denial Rationale */}
                <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', padding: '12px' }}>
                  <strong style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>INSUANRCE DENIAL RATIONALE:</strong>
                  <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{selectedClaim.denialDescription}</p>
                </div>
              </div>

              {/* Policy Research Grounds */}
              <div className="glass-card">
                <h3 className="card-title">⚖️ Autonomous Policy & Legal Research</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  The agent matched the denial reason against federal & state health compliance databases:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedClaim.policyResearch?.map((policy, idx) => (
                    <div key={idx} style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--primary-cyan)', fontSize: '0.95rem' }}>{policy.topic}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>{policy.summary}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-code)' }}>
                        Statutory Cites: {policy.cites.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appeal Draft & Actions */}
              <div className="glass-card">
                <div className="card-header">
                  <h3 className="card-title">📜 Formal Appeal Package</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!selectedClaim.appealLetter ? (
                      <button className="btn btn-primary" onClick={() => handleGenerateAppeal(selectedClaim.id)}>
                        Generate Appeal with Gemini 3.5 →
                      </button>
                    ) : selectedClaim.status === 'APPEAL_DRAFTED' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="email" 
                          value={customRecipient} 
                          onChange={(e) => setCustomRecipient(e.target.value)}
                          style={{ padding: '6px 10px', borderRadius: '8px', background: '#020617', border: '1px solid #334155', color: '#fff', fontSize: '0.85rem' }} 
                        />
                        <button className="btn btn-success" onClick={() => handleDispatchAppeal(selectedClaim.id)}>
                          Dispatch Appeal Email 🚀
                        </button>
                      </div>
                    ) : (
                      <span className="badge badge-APPEAL_SENT">Appeal Package Dispatched</span>
                    )}
                  </div>
                </div>

                {selectedClaim.appealLetter ? (
                  <pre className="code-view">{selectedClaim.appealLetter}</pre>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Click "Generate Appeal" above to have Gemini 3.5 construct a legally binding appeal letter.
                  </p>
                )}
              </div>

              {/* Audit Trail & Communications */}
              <div className="glass-card">
                <h3 className="card-title">📜 Reasoning Chain & Audit Logs</h3>
                <div className="timeline">
                  {selectedClaim.auditTrail?.map((log) => (
                    <div key={log.id} className="timeline-item">
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-code)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()} — {log.actor}
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--primary-cyan)' }}>
                        {log.action}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {JSON.stringify(log.details)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: 'var(--text-muted)' }}>Select a claim from the left sidebar or ingest a new document.</p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: ASYNC CARRIER SIMULATOR --- */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card">
            <div className="card-header">
              <h2 className="card-title">⚡ Asynchronous Carrier Response Simulator</h2>
              <span className="track-badge">Demonstrates Background Execution</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              This tool simulates an inbound email reply from an insurance carrier after days/weeks of waiting. 
              The agent autonomously evaluates the reply, updates its internal state machine in the Memory Bank, and determines next steps.
            </p>

            <div style={{ background: '#020617', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #1e293b' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Quick Preset Response Templates:
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSimulatorCarrierMsg("We received your appeal for Claim CLM-2026-884912. Upon re-review under the No Surprises Act, we have OVERTURNED the denial and approved reimbursement of $4,850.00 in full.")}
                >
                  🟢 Preset 1: Claim Approved & Overturned
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSimulatorCarrierMsg("Regarding your appeal for Claim PA-992140: We require additional physical therapy clinical chart notes from the treating physician prior to completing review.")}
                >
                  🟡 Preset 2: Request Additional Info / Chart Notes
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setSimulatorCarrierMsg("Level 1 Appeal Review Determination: Initial denial is UPHELD under plan rules. Further appeals must be submitted to the State Insurance Commissioner.")}
                >
                  🔴 Preset 3: Final Denial (Escalation Trigger)
                </button>
              </div>
            </div>

            <textarea 
              rows="4" 
              placeholder="Paste or type carrier email body..."
              value={simulatorCarrierMsg}
              onChange={(e) => setSimulatorCarrierMsg(e.target.value)}
              style={{
                width: '100%',
                background: '#020617',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                fontFamily: 'var(--font-code)',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}
            />

            <button 
              className="btn btn-primary" 
              onClick={handleSimulateCarrierReply}
              disabled={!selectedClaim}
              style={{ width: '100%' }}
            >
              Trigger Async Agent Response for "{selectedClaim ? selectedClaim.patientName : 'No Claim Selected'}" 🚀
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 4: GCP ARCHITECTURE & TELEMETRY --- */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Architecture Diagram Card */}
          <div className="glass-card">
            <div className="card-header">
              <h2 className="card-title">☁️ Production Architecture on Google Cloud</h2>
              <span className="track-badge">Google Cloud Native</span>
            </div>

            <div className="arch-diagram">
              <div className="arch-node active">
                <div style={{ fontSize: '1.5rem' }}>📄</div>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: '6px' }}>Document Intake</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF / Scanned Bill OCR</span>
              </div>
              <div className="arch-node active">
                <div style={{ fontSize: '1.5rem' }}>🤖</div>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: '6px' }}>Gemini 3.5 Flash</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>Google GenAI SDK</span>
              </div>
              <div className="arch-node active">
                <div style={{ fontSize: '1.5rem' }}>💾</div>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: '6px' }}>Memory Bank</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)' }}>Firestore / Cloud Storage</span>
              </div>
              <div className="arch-node active">
                <div style={{ fontSize: '1.5rem' }}>⏰</div>
                <strong style={{ fontSize: '0.9rem', display: 'block', marginTop: '6px' }}>Async Worker</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Cloud Run + Pub/Sub</span>
              </div>
            </div>
          </div>

          {/* Live Telemetry Data */}
          {telemetry && (
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--primary-cyan)' }}>
                  📊
                </div>
                <div>
                  <div className="metric-val">{telemetry.telemetry.totalClaimsIngested}</div>
                  <div className="metric-lbl">Total Claims Ingested</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
                  ⏳
                </div>
                <div>
                  <div className="metric-val">{telemetry.telemetry.activeAsyncAppeals}</div>
                  <div className="metric-lbl">Active Async Appeals</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
                  🎉
                </div>
                <div>
                  <div className="metric-val">{telemetry.telemetry.wonClaims}</div>
                  <div className="metric-lbl">Claims Overturned / Won</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
                  💵
                </div>
                <div>
                  <div className="metric-val">{telemetry.telemetry.totalDisputedValue}</div>
                  <div className="metric-lbl">Disputed Dollar Value</div>
                </div>
              </div>
            </div>
          )}

          {/* System Telemetry JSON */}
          <div className="glass-card">
            <h3 className="card-title">🖥️ OpenTelemetry System Audit JSON</h3>
            <pre className="code-view">{JSON.stringify(telemetry, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
