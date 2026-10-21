'use client';

import React from 'react';
import { FactCheckReport } from '@/types';
import { X, ShieldCheck, AlertTriangle, AlertCircle, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

interface FactCheckModalProps {
  report: FactCheckReport | null;
  onClose: () => void;
}

export const FactCheckModal: React.FC<FactCheckModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  const isVerified = report.accuracyScore >= 80;
  const isDisputed = report.accuracyScore < 50;

  const getScoreTheme = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500 text-white' };
    if (score >= 50) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500 text-slate-900' };
    return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500 text-white' };
  };

  const theme = getScoreTheme(report.accuracyScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className={`w-5 h-5 ${theme.text}`} />
            <h3 className="font-semibold text-white text-base">Summify Fact-Checking & Accuracy Audit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Top Score Gauge Card */}
          <div className={`p-4 rounded-xl border ${theme.bg} ${theme.border} flex items-center justify-between`}>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                Calculated Accuracy Score
              </span>
              <h4 className="text-xl font-bold text-white flex items-center gap-2">
                {report.verdict}
              </h4>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-extrabold ${theme.text}`}>
                {report.accuracyScore}%
              </span>
              <span className="text-[11px] text-slate-400">confidence</span>
            </div>
          </div>

          {/* Extracted Claim */}
          <div>
            <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2">
              Extracted Factual Assertion
            </h5>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 italic leading-relaxed">
              &ldquo;{report.extractedClaim}&rdquo;
            </div>
          </div>

          {/* Deep-Dive Analysis */}
          <div>
            <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2">
              Verification Assessment
            </h5>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
              {report.analysis}
            </p>
          </div>

          {/* Evidence Citations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Cross-Referenced Sources & Evidence ({report.evidence.length})
              </h5>
              <span className="text-[11px] text-slate-500 font-mono">
                Verified at {new Date(report.verifiedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-3">
              {report.evidence.map((ev, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{ev.sourceName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({ev.sourceDomain})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ev.stance === 'corroborates' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Corroborates
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Contradicts
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {ev.reliabilityScore}% rel.
                      </span>
                    </div>
                  </div>

                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors mb-1.5"
                  >
                    <span>{ev.title}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </a>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    &ldquo;{ev.snippet}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Automated multi-source corroboration engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
