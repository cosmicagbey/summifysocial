'use client';

import React from 'react';
import { Newspaper, Radio, PlusCircle, Users, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  onSimulate: () => void;
  onOpenIngest: () => void;
  onOpenCreators: () => void;
  onToggleFloating: () => void;
  isFloatingOpen: boolean;
  isSimulating: boolean;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSimulate,
  onOpenIngest,
  onOpenCreators,
  onToggleFloating,
  isFloatingOpen,
  isSimulating,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Real-time Indicator */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 border border-slate-700/80 flex items-center justify-center bg-slate-900 flex-shrink-0">
            <img 
              src="/logo.jpg" 
              alt="Summify Logo" 
              className="w-full h-full object-cover scale-110" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">SummifySocial</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AI Fact-Checked
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Social Aggregation Active</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Feed"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800/80"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-indigo-400' : 'text-indigo-400'}`} />
            <span>{isSimulating ? 'Ingesting...' : 'Simulate Breaking Story'}</span>
          </button>

          <button
            onClick={onOpenCreators}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Followed Creators</span>
          </button>

          <button
            onClick={onToggleFloating}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isFloatingOpen
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Floating Assistant</span>
          </button>

          <button
            onClick={onOpenIngest}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Fact-Check Any Post</span>
          </button>
        </div>
      </div>
    </header>
  );
};
