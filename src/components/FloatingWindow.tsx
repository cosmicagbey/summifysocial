'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Search, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Post } from '@/types';

interface FloatingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onPostVerified?: (post: Post) => void;
  initialUrl?: string;
}

export const FloatingWindow: React.FC<FloatingWindowProps> = ({
  isOpen,
  onClose,
  onPostVerified,
  initialUrl,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Auto-verify when an initialUrl is provided (e.g. from Android floating bubble clipboard detection)
  useEffect(() => {
    if (isOpen && initialUrl && initialUrl.trim()) {
      setUrl(initialUrl);
      // Trigger verification after a short delay to ensure component is mounted
      const timer = setTimeout(() => {
        handleVerifyUrl(initialUrl);
      }, 100);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrl, isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (targetUrl?: string) => {
    const inputUrl = targetUrl || url;
    if (!inputUrl.trim()) {
      setError('Please enter or paste a social media link.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/verify-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data.post);
      if (onPostVerified) {
        onPostVerified(data.post);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify URL');
    } finally {
      setLoading(false);
    }
  };

  // Alias used by the auto-verify useEffect
  const handleVerifyUrl = handleVerify;

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
          handleVerify(text);
        }
      }
    } catch {
      setError('Clipboard access denied. Please paste the link manually.');
    }
  };

  const getScoreTheme = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500 text-white' };
    if (score >= 50) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500 text-slate-900' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500 text-white' };
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-bottom-5 duration-300">
      {/* Minimized Bubble Pill */}
      {isMinimized ? (
        <div 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 border border-blue-500/40 shadow-2xl backdrop-blur-md cursor-pointer hover:bg-slate-800 transition-all group"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-400/60 shadow">
            <img src="/logo.jpg" alt="SummifySocial" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-blue-300">SummifySocial Quick-Verify</span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>
      ) : (
        /* Expanded Floating Window Card */
        <div className="w-[92vw] sm:w-[420px] bg-slate-950/95 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Top Window Header */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  SummifySocial Floating Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-slate-400">Verifies any copied social post link on the fly</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize window"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                title="Close floating window"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Paste & Search Input */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Paste post link from X, FB, or TikTok:</span>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedNotification ? 'Pasted!' : 'Paste from Clipboard'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="https://x.com/... or tiktok.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="w-full pl-3 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                >
                  {loading ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>Verify</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Tap Preset Test Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 text-[10px] font-medium">Try:</span>
              <button
                onClick={() => {
                  const testUrl = 'https://x.com/techinsider/status/1789201948-ai-chip-breakthrough';
                  setUrl(testUrl);
                  handleVerify(testUrl);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] whitespace-nowrap"
              >
                X: AI Chip Claim
              </button>
              <button
                onClick={() => {
                  const testUrl = 'https://tiktok.com/@sportsbreak/video/9871625-nba-trade';
                  setUrl(testUrl);
                  handleVerify(testUrl);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] whitespace-nowrap"
              >
                TikTok: Sports Trade
              </button>
              <button
                onClick={() => {
                  const testUrl = 'https://facebook.com/nasawatch/posts/8492049-space-water';
                  setUrl(testUrl);
                  handleVerify(testUrl);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] whitespace-nowrap"
              >
                FB: NASA Discovery
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Verification Result Card */}
            {result && (
              <div className="space-y-3 pt-2 animate-in fade-in">
                {/* Score Header */}
                {(() => {
                  const theme = getScoreTheme(result.factCheck.accuracyScore);
                  return (
                    <div className={`p-3 rounded-xl border ${theme.bg} ${theme.border} flex items-center justify-between`}>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Accuracy Verdict
                        </span>
                        <h5 className="text-xs font-bold text-white leading-tight">
                          {result.factCheck.verdict}
                        </h5>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`text-2xl font-black ${theme.text}`}>
                          {result.factCheck.accuracyScore}%
                        </span>
                        <span className="text-[10px] text-slate-400">score</span>
                      </div>
                    </div>
                  );
                })()}

                {/* AI Summary */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Quick Summary</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {result.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2.5 space-y-1 text-[11px] text-slate-300">
                    {result.keyTakeaways.map((point, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span className="leading-tight">{point}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Corroborating Sources Snippet */}
                {result.factCheck.evidence && result.factCheck.evidence.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                      Cross-Referenced Sources:
                    </span>
                    <div className="space-y-1">
                      {result.factCheck.evidence.slice(0, 2).map((ev, i) => (
                        <a
                          key={i}
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 text-[11px] text-slate-300 hover:text-white transition-colors group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-white">{ev.sourceName}</span>
                            <span className="text-slate-500 font-mono text-[10px]">({ev.sourceDomain})</span>
                          </div>
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 flex-shrink-0 ml-1 text-blue-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Save Pill */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Check className="w-3 h-3" /> Saved to your SummifySocial feed
                  </span>
                  <a
                    href={result.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View Original
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
