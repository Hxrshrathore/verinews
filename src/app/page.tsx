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
import PixelSnow from "@/components/PixelSnow";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import "./globals.css";

interface VerificationResult {
  verdict: "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIED";
  confidence: number;
  reason: string;
  sources: string[];
}

const placeholders = [
  "Did India land on the south pole of the moon?",
  "Is the 'Tyler Durden' news a hoax?",
  "Verify: 'Drinking coffee prevents all diseases'",
  "Is 'EURO 2024' scheduled for Germany?",
  "Check claim: 'AI will replace 50% of jobs by 2025'",
];

export default function Home() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!claim.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);
    setProgress(0);
    setStatusText("Initializing...");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({ claim }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 429) {
        const errorData = await res.json();
        setError(errorData.error);
        setLoading(false);
        return;
      }

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunks = decoder.decode(value).split("\n").filter(Boolean);
        for (const chunk of chunks) {
          try {
            const message = JSON.parse(chunk);
            if (message.type === 'status') {
              setStatusText(message.status);
              setProgress(message.progress);
            } else if (message.type === 'result') {
              setResult(message.data);
            } else if (message.type === 'error') {
              throw new Error(message.error);
            }
          } catch (e) {
            console.error("Chunk parse error:", e);
          }
        }
      }
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
    <div className="flex flex-col min-h-screen bg-bg text-fg selection:bg-accent/30 overflow-x-hidden">
      {/* Immersive Hero Section */}
      <section className="relative w-full h-[85vh] flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <PixelSnow 
            color="#3b82f6"
            flakeSize={0.01}
            minFlakeSize={1.2}
            pixelResolution={180}
            speed={1.0}
            density={0.25}
          />
        </div>
        
        <div className="relative z-10 w-full max-w-[900px] text-center animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[12px] font-bold tracking-widest uppercase text-fg-sub">Intelligence V2.0 Active</span>
          </div>
          
          <h1 className="text-[52px] md:text-[84px] font-black tracking-tighter leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Verify with <br /> Intelligence.
          </h1>
          
          <p className="text-[18px] md:text-[21px] text-fg-sub max-w-[600px] mx-auto mb-12 font-medium tracking-tight leading-relaxed">
            Revolutionizing information integrity with deep multi-vector search and Decisive AI analysis.
          </p>

          <div className="w-full max-w-2xl mx-auto h-[60px] relative">
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={(e) => setClaim(e.target.value)}
              onSubmit={() => handleVerify()}
            />
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <div className="w-px h-12 bg-gradient-to-b from-accent to-transparent" />
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto px-6 w-full -mt-20 relative z-20 pb-20">
        {loading && (
          <div className="max-w-[800px] mx-auto mt-12 animate-reveal-up">
            <div className="mb-4 flex justify-between items-center px-2">
              <span className="text-[14px] font-extrabold text-accent uppercase tracking-widest animate-pulse">{statusText}</span>
              <span className="text-[14px] font-bold text-fg-sub">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-[800px] mx-auto mt-12 animate-reveal-up">
            <div className="bento-card bg-red-500/5 border-red-500/20 flex flex-col items-center text-center py-12">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-[20px] font-bold tracking-tight mb-2">Analysis Interrupted</h3>
              <p className="text-fg-sub text-[15px] max-w-[400px] italic">
                {error}
              </p>
              <button 
                onClick={() => handleVerify()}
                className="mt-8 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[13px] font-bold hover:bg-white/10 transition-all"
              >
                Retry Protocol
              </button>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="grid grid-cols-12 gap-5 mt-16 animate-reveal-up">
            {/* Bento Card: Verdict */}
            <div className="col-span-12 md:col-span-8 bento-card flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      {getVerdictIcon(result.verdict)}
                    </div>
                    <div>
                      <h3 className="text-[20px] font-bold tracking-tight">Intelligence Verdict</h3>
                      <p className="text-[12px] text-fg-sub uppercase tracking-wider font-bold mt-0.5">Real-time Analysis</p>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-[12px] font-black tracking-widest uppercase border ${
                    result.verdict === 'REAL' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    result.verdict === 'FAKE' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    result.verdict === 'MISLEADING' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    'bg-accent/10 text-accent border-accent/20'
                  }`}>
                    {result.verdict}
                  </span>
                </div>
                <p className="text-[22px] md:text-[26px] leading-[1.4] font-medium tracking-tight text-fg/90 mb-8">
                  {result.reason}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-white/5">
                {result.sources.slice(0, 4).map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[12px] font-bold hover:bg-white/10 hover:border-accent/40 transition-all">
                    <Globe size={14} className="text-accent" /> 
                    <span>{new URL(src).hostname.replace('www.', '')}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Bento Card: Confidence */}
            <div className="col-span-12 md:col-span-4 bento-card flex flex-col items-center justify-center min-h-[340px]">
              <h4 className="text-[13px] text-fg-sub font-bold uppercase tracking-widest mb-8">Certainty Matrix</h4>
              <div className="relative w-full h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="80%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={75}
                      outerRadius={95}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="var(--color-accent)" />
                      <Cell fill="rgba(255,255,255,0.05)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-[56px] font-black tracking-tighter leading-none">{result.confidence}%</div>
                  <div className="text-[10px] text-fg-sub font-black uppercase tracking-[0.2em] mt-2">Precision</div>
                </div>
              </div>
            </div>

            {/* Bento Card: Diversities */}
            <div className="col-span-12 md:col-span-5 bento-card min-h-[280px]">
              <h4 className="text-[13px] text-fg-sub font-bold uppercase tracking-widest mb-8">Node Distribution</h4>
              <div className="w-full h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceStats}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ background: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-fg-sub mt-6 text-center font-bold tracking-wider opacity-60">
                SCANNED {result.sources.length} UNIQUE INTELLIGENCE NODES
              </p>
            </div>

            {/* Bento Card: Rapid Context */}
            <div className="col-span-12 md:col-span-7 bento-card flex flex-col gap-6 min-h-[280px]">
              <h4 className="text-[13px] text-fg-sub font-bold uppercase tracking-widest">Protocol Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                    <Globe size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-[16px]">Global Indexing</div>
                    <div className="text-[12px] text-fg-sub font-medium">Search Complete</div>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <div className="font-bold text-[16px]">Fact-Check</div>
                    <div className="text-[12px] text-fg-sub font-medium">Secure Verification</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrity Logs Section */}
        <section className="mt-32">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-[32px] font-black tracking-tight mb-2">Integrity Logs</h2>
              <p className="text-[14px] text-fg-sub font-medium uppercase tracking-widest opacity-60 italic">Historical Database of Verified Claims</p>
            </div>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[14px] font-bold flex items-center gap-2 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
            >
              <HistoryIcon size={18} />
              {showHistory ? "Collapse Logs" : "Expand History"}
            </button>
          </div>

          {showHistory && (
            <div className="grid gap-4 animate-reveal-up">
              {history.length > 0 ? history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group glass-panel rounded-2xl p-6 flex justify-between items-center hover:border-accent transition-all duration-400 cursor-pointer"
                  onClick={() => { setClaim(item.claim); setResult(item); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                >
                  <div className="flex gap-6 items-center overflow-hidden">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      item.verdict === 'REAL' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                      item.verdict === 'FAKE' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,44,44,0.5)]' :
                      item.verdict === 'MISLEADING' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' :
                      'bg-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    }`} />
                    <div className="overflow-hidden">
                      <div className="font-bold text-[17px] truncate text-fg group-hover:text-accent transition-colors">{item.claim}</div>
                      <div className="text-[11px] text-fg-sub font-bold uppercase tracking-wider mt-1">
                        {item.verdict} • {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-fg-sub group-hover:translate-x-1 transition-transform" />
                </div>
              )) : (
                <div className="bento-card text-center py-20 text-fg-sub font-bold tracking-widest opacity-20 italic">DATABASE EMPTY</div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="w-full py-16 px-6 border-t border-white/5 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-[13px] font-bold text-fg-sub uppercase tracking-widest">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={18} />
             </div>
             <span>© 2026 VeriNews AI Core</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-accent transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
