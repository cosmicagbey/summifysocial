'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  ArrowRight,
  FileText,
  User,
  Radio
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
  const [showOriginalText, setShowOriginalText] = useState(false);

  const handleVerify = useCallback(async (targetUrl?: string) => {
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
      setError(err.message || 'Failed to verify URL. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  }, [url, onPostVerified]);

  // Listen to native Android clipboard capture events from AndroidBridge
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onNativeClipboardCaptured = (capturedText: string) => {
        if (capturedText && capturedText.trim().startsWith('http')) {
          setUrl(capturedText.trim());
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
          handleVerify(capturedText.trim());
        } else if (capturedText && capturedText.trim()) {
          setUrl(capturedText.trim());
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).onNativeClipboardCaptured;
      }
    };
  }, [handleVerify]);

  // Auto-verify when initialUrl is passed
  useEffect(() => {
    if (isOpen && initialUrl && initialUrl.trim()) {
      setUrl(initialUrl);
      const timer = setTimeout(() => {
        handleVerify(initialUrl);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialUrl, isOpen, handleVerify]);

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    setError(null);

    // 1. Try Native Android Bridge first (handles Android 10+ background restrictions)
    try {
      if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
        const bridge = (window as any).AndroidBridge;
        if (typeof bridge.getClipboardText === 'function') {
          const nativeText = bridge.getClipboardText();
          if (nativeText && nativeText.trim()) {
            setUrl(nativeText.trim());
            setCopiedNotification(true);
            setTimeout(() => setCopiedNotification(false), 2000);
            handleVerify(nativeText.trim());
            return;
          }
        }
        if (typeof bridge.requestClipboardPaste === 'function') {
          bridge.requestClipboardPaste();
          return;
        }
      }
    } catch (e) {
      console.warn('AndroidBridge paste failed, trying browser clipboard:', e);
    }

    // 2. Browser navigator.clipboard fallback
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
          handleVerify(text.trim());
          return;
        }
      }
    } catch (err: any) {
      console.warn('Navigator clipboard error:', err);
    }

    // If both failed (browser permission blocked), prompt user
    setError('Clipboard access was blocked by the browser. Please tap and paste your link into the box.');
  };

  const getScoreTheme = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500 text-white' };
    if (score >= 50) return { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500 text-slate-900' };
    return { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500 text-white' };
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
        <div className="w-[94vw] sm:w-[440px] bg-slate-950/98 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[88vh]">
          {/* Top Window Header */}
          <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-700 flex-shrink-0">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                  SummifySocial Verifier
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-slate-400">Summarizes what is said & cross-checks facts</p>
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
                <span>Paste link from X, FB, TikTok, YouTube:</span>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer active:scale-95 transition-transform"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedNotification ? 'Pasted!' : 'Paste from Clipboard'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    placeholder="https://x.com/... or facebook.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className="w-full pl-3 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 disabled:opacity-50 flex-shrink-0 active:scale-95"
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

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div className="py-8 text-center space-y-2">
                <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-white">Extracting real post & cross-referencing...</p>
                <p className="text-[10px] text-slate-400">Reading content, building summary, and checking news wires</p>
              </div>
            )}

            {/* Verification Result Section */}
            {result && !loading && (
              <div className="space-y-3.5 pt-1 animate-in fade-in">
                {/* 1. Author & Source Card */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                      <img src={result.author.avatarUrl} alt={result.author.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white leading-tight">{result.author.name}</span>
                        {result.author.verified && (
                          <span className="text-blue-400 text-[11px]" title="Verified">✓</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">{result.author.handle}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase">
                    {result.platform}
                  </span>
                </div>

                {/* 2. What Is Being Said (Summary Section) */}
                <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-3.5 space-y-2 shadow-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Summary of What Is Being Said</span>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed font-normal">
                    {result.summary}
                  </p>
                </div>

                {/* 3. Key Takeaways */}
                {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Key Points & Claims:
                    </span>
                    <div className="space-y-1.5">
                      {result.keyTakeaways.map((point, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs text-slate-200">
                          <span className="text-blue-400 font-bold">•</span>
                          <span className="leading-tight">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Original Extracted Content Accordion */}
                {result.originalContent && (
                  <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
                    <button
                      type="button"
                      onClick={() => setShowOriginalText(!showOriginalText)}
                      className="w-full px-3 py-2 text-left flex items-center justify-between text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-medium text-[11px]">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>View Original Post Text</span>
                      </span>
                      {showOriginalText ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    {showOriginalText && (
                      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-300 bg-slate-950/60 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
                        {result.originalContent}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Real-Time Fact-Check & Accuracy Verdict */}
                {(() => {
                  const theme = getScoreTheme(result.factCheck.accuracyScore);
                  return (
                    <div className={`p-3.5 rounded-xl border ${theme.bg} ${theme.border} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Fact-Check Verdict
                          </span>
                          <h5 className="text-xs font-bold text-white leading-tight">
                            {result.factCheck.verdict}
                          </h5>
                        </div>
                        <div className="flex flex-col items-center pl-2">
                          <span className={`text-2xl font-black ${theme.text}`}>
                            {result.factCheck.accuracyScore}%
                          </span>
                          <span className="text-[10px] text-slate-400">accuracy</span>
                        </div>
                      </div>

                      {result.factCheck.analysis && (
                        <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2">
                          {result.factCheck.analysis}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* 6. Live Corroborating News Sources */}
                {result.factCheck.evidence && result.factCheck.evidence.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span>Live News Corroboration ({result.factCheck.evidence.length} sources):</span>
                    </span>
                    <div className="space-y-1.5">
                      {result.factCheck.evidence.map((ev, i) => (
                        <a
                          key={i}
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="flex-1 pr-2 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-[11px] truncate">{ev.sourceName}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                ev.stance === 'corroborates' ? 'bg-emerald-500/20 text-emerald-400' :
                                ev.stance === 'refutes' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                              }`}>
                                {ev.stance}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{ev.title}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 flex-shrink-0 text-blue-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Save / View Original */}
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Check className="w-3 h-3" /> Saved to feed
                  </span>
                  <a
                    href={result.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>View original link</span>
                    <ExternalLink className="w-3 h-3" />
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
