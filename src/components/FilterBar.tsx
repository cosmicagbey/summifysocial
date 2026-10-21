'use client';

import React from 'react';
import { Category, Platform, AggregatorFilter } from '@/types';
import { Search, SlidersHorizontal, ShieldCheck, Cpu, Trophy, Film, Building2, Atom } from 'lucide-react';

interface FilterBarProps {
  filter: AggregatorFilter;
  onChange: (filter: AggregatorFilter) => void;
  totalPosts: number;
}

const CATEGORIES: { id: Category | 'all'; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'tech', label: 'Tech & AI', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'science', label: 'Science & Space', icon: <Atom className="w-3.5 h-3.5" /> },
  { id: 'sports', label: 'Sports', icon: <Trophy className="w-3.5 h-3.5" /> },
  { id: 'entertainment', label: 'Entertainment', icon: <Film className="w-3.5 h-3.5" /> },
  { id: 'business', label: 'Business & Finance', icon: <Building2 className="w-3.5 h-3.5" /> },
];

const PLATFORMS: { id: Platform | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All Platforms', color: 'bg-slate-700' },
  { id: 'twitter', label: 'X (Twitter)', color: 'bg-black text-white' },
  { id: 'facebook', label: 'Facebook', color: 'bg-blue-600 text-white' },
  { id: 'tiktok', label: 'TikTok', color: 'bg-rose-500 text-white' },
  { id: 'youtube', label: 'YouTube', color: 'bg-red-600 text-white' },
  { id: 'reddit', label: 'Reddit', color: 'bg-orange-600 text-white' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ filter, onChange, totalPosts }) => {
  return (
    <div className="w-full space-y-4 mb-6">
      {/* Top Search & Accuracy Threshold */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl backdrop-blur-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => onChange({ ...filter, searchQuery: e.target.value })}
            placeholder="Search verified news, creators, keywords, or topics..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Accuracy Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 text-xs">
          <span className="text-slate-400 pl-2 pr-1 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Accuracy:
          </span>
          <button
            onClick={() => onChange({ ...filter, minAccuracy: 0 })}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter.minAccuracy === 0
                ? 'bg-blue-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onChange({ ...filter, minAccuracy: 80 })}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter.minAccuracy === 80
                ? 'bg-emerald-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            80%+ Verified
          </button>
          <button
            onClick={() => onChange({ ...filter, minAccuracy: 90 })}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter.minAccuracy === 90
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            90%+ High
          </button>
        </div>

        {/* Counter */}
        <div className="hidden lg:flex items-center text-xs text-slate-400 px-2 font-mono">
          <span>{totalPosts} {totalPosts === 1 ? 'story' : 'stories'}</span>
        </div>
      </div>

      {/* Categories & Platforms Horizontal Rows */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const active = filter.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onChange({ ...filter, category: cat.id })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/10'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Platform Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {PLATFORMS.map((plat) => {
            const active = filter.platform === plat.id;
            return (
              <button
                key={plat.id}
                onClick={() => onChange({ ...filter, platform: plat.id })}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'
                }`}
              >
                {plat.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
