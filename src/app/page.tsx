"use client";

import { useState, useEffect } from "react";
import { Search, Globe, ChevronRight, History as HistoryIcon, Loader2, ArrowRightCircle } from "lucide-react";
import "./globals.css";

interface VerificationResult {
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  reason: string;
  sources: string[];
}

export default function Home() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleVerify = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({ claim }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      fetchHistory();
    } catch (error: any) {
      alert("Verification Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/verify");
      const data = await res.json();
      setHistory(data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>VeriNews</h1>
        <p className="subtitle">The standard for information integrity.</p>
      </header>

      <div className="search-container">
        <textarea
          placeholder="Enter a claim to verify..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          disabled={loading}
        />
        <div className="action-bar">
          <button 
            className="btn-primary" 
            onClick={handleVerify} 
            disabled={loading || !claim.trim()}
          >
            {loading ? <Loader2 className="shimmer" size={20} /> : "Verify Now"}
          </button>
        </div>
      </div>

      {result && (
        <section className="result-card">
          <span className={`verdict-banner verdict-${result.verdict}`}>
            Analysis Verdict
          </span>
          <div className="confidence-display">
            {result.verdict === "REAL" ? "" : result.verdict === "FAKE" ? "" : ""}
            {result.confidence}%
            <span style={{ fontSize: '24px', verticalAlign: 'middle', marginLeft: '10px', color: 'var(--text-sub)' }}>Confidence</span>
          </div>

          <p className="explanation">{result.reason}</p>

          <div style={{ marginTop: '32px' }}>
            {result.sources.map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="source-tag">
                <Globe size={14} /> {new URL(src).hostname} <ChevronRight size={12} />
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="history-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Recent Activity</h2>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '17px', fontWeight: 500 }}
          >
            {showHistory ? "Show Less" : "See All"}
          </button>
        </div>

        {showHistory && (
          <div className="history-grid">
            {history.map((item, idx) => (
              <div key={idx} className="history-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={`verdict-banner verdict-${item.verdict}`} style={{ fontSize: '11px' }}>{item.verdict}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="history-title">{item.claim}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineClamp: 2 }}>{item.reason}</p>
              </div>
            ))}
          </div>
        )}
      </footer>
    </main>
  );
}
