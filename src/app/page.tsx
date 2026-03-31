"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Globe, 
  ChevronRight, 
  Loader2, 
  ArrowRightCircle, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink,
  History as HistoryIcon,
  Search,
  XCircle,
  HelpCircle
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip,
} from "recharts";
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

  const gaugeData = useMemo(() => {
    if (!result) return [];
    return [
      { name: 'Confidence', value: result.confidence },
      { name: 'Remaining', value: 100 - result.confidence }
    ];
  }, [result]);

  const sourceStats = useMemo(() => {
    if (!result) return [];
    const domains = result.sources.map(s => {
      try { return new URL(s).hostname.replace('www.', ''); } catch { return 'unknown'; }
    });
    const counts = domains.reduce((acc: any, d) => {
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [result]);

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'REAL': return <ShieldCheck className="text-green-500" size={24} />;
      case 'FAKE': return <XCircle className="text-red-500" size={24} />;
      case 'MISLEADING': return <AlertCircle className="text-orange-500" size={24} />;
      default: return <HelpCircle className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-fg">
      <header className="max-w-[1100px] mx-auto px-6 w-full py-10 text-center animate-reveal border-b border-card-border mb-10">
        <nav className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent rounded-xl text-white">
              <ShieldCheck size={24} />
            </div>
            <span className="text-[20px] font-bold tracking-tight text-fg">VeriNews AI</span>
          </div>
          <div className="hidden md:flex gap-6 text-[14px] font-medium text-fg-sub">
            <a href="#" className="hover:text-accent transition-colors">Solutions</a>
            <a href="#" className="hover:text-accent transition-colors">Enterprise</a>
            <a href="#" className="hover:text-accent transition-colors">Docs</a>
          </div>
        </nav>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 w-full flex-1">
        <section className="min-h-[50vh] flex flex-col justify-center">
          <h1 className="text-center text-[40px] md:text-[64px] font-extrabold tracking-tight mb-3">Verify with Intelligence.</h1>
          <p className="text-center text-[18px] md:text-[22px] text-fg-sub max-w-[580px] mx-auto mb-[60px] font-normal tracking-tight">
            High-fidelity SaaS engine for real-time news verification and architectural analysis.
          </p>

          <div className="relative bg-card-bg backdrop-blur-[20px] rounded-[30px] border border-card-border p-2.5 shadow-premium transition-all duration-500 ease-apple max-w-[800px] mx-auto focus-within:scale-[1.005] focus-within:border-accent focus-within:shadow-[0_20px_60px_rgba(0,113,227,0.1)]">
            <textarea
              placeholder="Paste a complex statement or news claim..."
              className="w-full border-none bg-transparent p-6 text-[20px] text-fg resize-none min-h-[80px] outline-none font-sans"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              disabled={loading}
              rows={2}
            />
            <div className="flex justify-between items-center p-3 text-fg">
              <span className="text-[12px] text-fg-sub ml-3">
                Secure AI Processing • 256-bit Search Encryption
              </span>
              <button 
                className="bg-accent text-white border-none px-6 py-3 rounded-full text-[16px] font-semibold cursor-pointer transition-all duration-300 ease-apple flex items-center gap-2 hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed" 
                onClick={handleVerify} 
                disabled={loading || !claim.trim()}
              >
                {loading ? <Loader2 className="animate-shimmer" size={18} /> : <Search size={18} />}
                <span>{loading ? "Analyzing Context..." : "Verify Intelligence"}</span>
              </button>
            </div>
          </div>
        </section>

        {loading && (
          <div className="grid grid-cols-12 gap-6 mt-[60px] animate-reveal-up">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="col-span-12 md:col-span-6 bg-card-bg opacity-10 h-[200px] rounded-premium shimmer-bg animate-shimmer" />
            ))}
          </div>
        )}

        {result && !loading && (
          <div className="grid grid-cols-12 gap-6 mt-[60px] animate-reveal-up">
            {/* Main Verdict Widget */}
            <div className="col-span-12 md:col-span-8 bg-card-bg backdrop-blur-[10px] rounded-premium border border-card-border p-8 shadow-premium transition-transform duration-400 ease-apple hover:-translate-y-1">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  {getVerdictIcon(result.verdict)}
                  <h3 className="text-[20px] font-bold">Analysis Verdict</h3>
                </div>
                <span className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-[0.1em] uppercase ${
                  result.verdict === 'REAL' ? 'bg-green-500/15 text-green-500' :
                  result.verdict === 'FAKE' ? 'bg-red-500/15 text-red-500' :
                  result.verdict === 'MISLEADING' ? 'bg-orange-500/15 text-orange-500' :
                  'bg-blue-500/15 text-blue-500'
                }`}>
                  {result.verdict}
                </span>
              </div>
              <p className="text-[18px] leading-relaxed text-fg mb-8">
                {result.reason}
              </p>
              
              <div className="border-t border-card-border pt-6">
                <h4 className="text-[14px] text-fg-sub font-medium uppercase tracking-[0.05em] mb-4">Intelligence Sources</h4>
                <div className="flex flex-wrap gap-3">
                  {result.sources.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-card-bg border border-card-border rounded-lg px-4 py-2 text-[13px] font-semibold hover:border-accent hover:text-accent transition-all duration-300">
                      <Globe size={14} className="text-accent" /> 
                      <span>{new URL(src).hostname.replace('www.', '')}</span>
                      <ExternalLink size={12} className="opacity-40" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Confidence Gauge Widget */}
            <div className="col-span-12 md:col-span-4 bg-card-bg backdrop-blur-[10px] rounded-premium border border-card-border p-8 shadow-premium transition-transform duration-400 ease-apple hover:-translate-y-1 flex flex-col items-center justify-center">
              <h4 className="text-[14px] text-fg-sub font-medium uppercase tracking-[0.05em] mb-4">Certainty Score</h4>
              <div className="relative w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="80%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill="var(--color-accent)" stroke="none" />
                      <Cell fill="var(--color-card-border)" stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-fg">
                  <div className="text-[48px] font-extrabold tracking-tight leading-none">{result.confidence}%</div>
                  <div className="text-[11px] text-fg-sub font-bold uppercase mt-1">Precision</div>
                </div>
              </div>
            </div>

            {/* Source Distribution Widget */}
            <div className="col-span-12 md:col-span-6 bg-card-bg backdrop-blur-[10px] rounded-premium border border-card-border p-8 shadow-premium transition-transform duration-400 ease-apple hover:-translate-y-1">
              <h4 className="text-[14px] text-fg-sub font-medium uppercase tracking-[0.05em] mb-6">Source Diversity</h4>
              <div className="w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceStats}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ background: 'var(--color-glass)', border: '1px solid var(--color-card-border)', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: 'var(--color-fg)' }}
                    />
                    <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[12px] text-fg-sub mt-4 text-center">
                Web integration coverage across {result.sources.length} domains.
              </p>
            </div>

            {/* Rapid Context Widget */}
            <div className="col-span-12 md:col-span-6 bg-card-bg backdrop-blur-[10px] rounded-premium border border-card-border p-8 shadow-premium transition-transform duration-400 ease-apple hover:-translate-y-1 flex flex-col gap-5">
              <h4 className="text-[14px] text-fg-sub font-medium uppercase tracking-[0.05em]">Rapid Context</h4>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                  <Globe size={20} />
                </div>
                <div>
                  <div className="font-semibold text-fg">Global Indexing</div>
                  <div className="text-[12px] text-fg-sub">Real-time search completed</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-semibold text-fg text-fg">Fact-Check Protocol</div>
                  <div className="text-[12px] text-fg-sub">Verified against 3 major databases</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="mt-[100px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[28px] font-extrabold tracking-tight text-fg">Integrity Logs</h2>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="bg-transparent border-none text-accent font-semibold flex items-center gap-1 hover:brightness-110 transition-all cursor-pointer"
            >
              <HistoryIcon size={16} />
              {showHistory ? "Collapse Logs" : "View Recent Logs"}
            </button>
          </div>

          {showHistory && (
            <div className="grid gap-3">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="bg-card-bg border border-card-border rounded-2xl p-6 flex justify-between items-center hover:border-accent hover:translate-x-1 transition-all duration-300 cursor-pointer" onClick={() => { setClaim(item.claim); setResult(item); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
                  <div className="flex gap-4 items-center overflow-hidden">
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                      item.verdict === 'REAL' ? 'bg-green-500/15 text-green-500' :
                      item.verdict === 'FAKE' ? 'bg-red-500/15 text-red-500' :
                      item.verdict === 'MISLEADING' ? 'bg-orange-500/15 text-orange-500' :
                      'bg-blue-500/15 text-blue-500'
                    }`}>{item.verdict}</div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-[15px] truncate text-fg">{item.claim}</div>
                      <div className="text-[12px] text-fg-sub">{new Date(item.created_at).toLocaleDateString()} • {item.confidence}% Confidence</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-fg-sub flex-shrink-0" />
                </div>
              )) : (
                <div className="text-center py-10 text-fg-sub">No logs available.</div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-[1100px] mx-auto px-6 w-full py-10 text-fg-sub text-[14px] border-t border-card-border mt-[100px]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>© 2026 VeriNews AI. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-accent transition-colors underline-offset-4 hover:underline">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors underline-offset-4 hover:underline">Terms of Service</a>
            <a href="#" className="hover:text-accent transition-colors underline-offset-4 hover:underline">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
