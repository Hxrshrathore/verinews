"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, History as HistoryIcon, Globe, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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
      alert("Error: " + error.message);
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
        <h1>VeriNews AI</h1>
        <p className="subtitle">Instant Truth Verification Engine</p>
      </header>

      <div className="card search-box">
        <textarea
          placeholder="Paste news headline or claim here..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          disabled={loading}
        />
        <button className="btn" onClick={handleVerify} disabled={loading || !claim.trim()}>
          {loading ? <Loader2 className="pulse" size={20} /> : <Search size={20} />}
          {loading ? "Analyzing..." : "Verify Claim"}
        </button>
      </div>

      {result && (
        <div className="card fade-in">
          <div className="result-header">
            <div>
              <span className={`badge badge-${result.verdict}`}>
                {result.verdict}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Confidence</span>
              <div style={{ fontWeight: "bold" }}>{result.confidence}%</div>
            </div>
          </div>

          <div className="confidence-bar">
            <div className="confidence-fill" style={{ width: `${result.confidence}%` }}></div>
          </div>

          <div className="reason">
            <p>{result.reason}</p>
          </div>

          {result.sources.length > 0 && (
            <div className="sources-list">
              <p style={{ fontSize: "0.8rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#94a3b8" }}>SOURCES</p>
              {result.sources.map((src: string, i: number) => (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="source-item">
                  <Globe size={14} /> {src}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
        <button 
          className="btn" 
          style={{ background: "transparent", border: "1px solid var(--card-border)" }}
          onClick={() => setShowHistory(!showHistory)}
        >
          <HistoryIcon size={18} />
          {showHistory ? "Hide History" : "View Recent Checks"}
        </button>
      </div>

      {showHistory && (
        <div className="fade-in" style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", textAlign: "center" }}>Recent Verifications</h2>
          {history.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: "1.2rem", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span className={`badge badge-${item.verdict}`} style={{ padding: "0.2rem 0.6rem", fontSize: "0.6rem" }}>
                  {item.verdict}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "0.5rem" }}>{item.claim}</p>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {item.reason}
              </p>
            </div>
          ))}
          {history.length === 0 && (
            <p style={{ textAlign: "center", color: "#64748b", fontStyle: "italic" }}>No history found.</p>
          )}
        </div>
      )}
    </main>
  );
}
