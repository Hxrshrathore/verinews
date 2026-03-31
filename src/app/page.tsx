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
    <main className="container" style={{ position: 'relative', zIndex: 1 }}>
      <header>
        <h1>VeriNews AI</h1>
        <p className="subtitle">High-fidelity information verification powered by advanced AI and real-time search.</p>
      </header>

      <div className="search-container">
        <textarea
          placeholder="Paste a news claim or statement here..."
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
            {loading ? (
              <>
                <Loader2 className="shimmer" size={20} />
                <span>Analyzing Sources...</span>
              </>
            ) : (
              <>
                <span>Verify Credibility</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <section className="result-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className={`verdict-banner verdict-${result.verdict}`}>
              {result.verdict} VERDICT
            </span>
          </div>
          
          <div className="confidence-display">
            {result.confidence}%
            <span className="confidence-label">Confidence Score</span>
          </div>

          <p className="explanation">{result.reason}</p>

          <div style={{ marginTop: '40px' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-sub)', marginBottom: '16px' }}>REFERENCES</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {result.sources.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="source-tag">
                  <Globe size={14} /> 
                  <span style={{ fontWeight: 500 }}>{new URL(src).hostname.replace('www.', '')}</span>
                  <ArrowRightCircle size={12} style={{ opacity: 0.5 }} />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="history-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--text-main) 0%, var(--text-sub) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Integrity History
          </h2>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            style={{ 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', 
              padding: '8px 20px', 
              borderRadius: '980px', 
              cursor: 'pointer', 
              fontSize: '15px', 
              fontWeight: 600,
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            {showHistory ? "Show Less" : "Explore All"}
          </button>
        </div>

        {showHistory && (
          <div className="history-grid">
            {history.length > 0 ? history.map((item, idx) => (
              <div key={idx} className="history-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                  <span className={`verdict-banner verdict-${item.verdict}`} style={{ fontSize: '10px', padding: '4px 10px', margin: 0 }}>{item.verdict}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 500 }}>{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <h3 className="history-title">{item.claim}</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.reason}
                </p>
              </div>
            )) : (
              <p style={{ color: 'var(--text-sub)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No verification history found.</p>
            )}
          </div>
        )}
      </footer>
    </main>
  );
}
