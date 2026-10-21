'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Post, AggregatorFilter, FactCheckReport } from '@/types';
import { Navbar } from '@/components/Navbar';
import { FilterBar } from '@/components/FilterBar';
import { PostCard } from '@/components/PostCard';
import { FactCheckModal } from '@/components/FactCheckModal';
import { IngestModal } from '@/components/IngestModal';
import { CreatorsModal } from '@/components/CreatorsModal';
import { FloatingWindow } from '@/components/FloatingWindow';
import { 
  Sparkles, 
  ShieldAlert, 
  Radio, 
  TrendingUp, 
  FilterX, 
  Flame, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FactCheckReport | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isCreatorsOpen, setIsCreatorsOpen] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [newPostNotice, setNewPostNotice] = useState<string | null>(null);

  const [filter, setFilter] = useState<AggregatorFilter>({
    category: 'all',
    platform: 'all',
    minAccuracy: 0,
    searchQuery: '',
    status: 'all',
  });

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.category !== 'all') params.append('category', filter.category);
      if (filter.platform !== 'all') params.append('platform', filter.platform);
      if (filter.minAccuracy > 0) params.append('minAccuracy', filter.minAccuracy.toString());
      if (filter.searchQuery.trim()) params.append('query', filter.searchQuery.trim());

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Live feed simulation trigger
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/feed/simulate', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.post) {
        setNewPostNotice(`New incoming post from ${data.post.author.name} (${data.post.factCheck.accuracyScore}% Accuracy)`);
        setTimeout(() => setNewPostNotice(null), 5000);
        fetchPosts();
      }
    } catch (err) {
      console.error('Simulate failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Calculate live stats
  const totalStories = posts.length;
  const verifiedCount = posts.filter(p => p.factCheck.accuracyScore >= 80).length;
  const avgAccuracy = totalStories > 0
    ? Math.round(posts.reduce((acc, p) => acc + p.factCheck.accuracyScore, 0) / totalStories)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar
        onSimulate={handleSimulate}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenCreators={() => setIsCreatorsOpen(true)}
        onToggleFloating={() => setIsFloatingOpen(!isFloatingOpen)}
        isFloatingOpen={isFloatingOpen}
        isSimulating={isSimulating}
        onRefresh={fetchPosts}
        isLoading={loading}
      />

      {/* Breaking New Story Flash Notification */}
      {newPostNotice && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs py-2 px-4 text-center font-medium shadow-md animate-in slide-in-from-top flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{newPostNotice}</span>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Metric Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Active Monitored Feeds
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-white">6 Platforms</span>
              <span className="text-xs text-blue-400 font-mono">X • FB • TikTok</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Analyzed Stories
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-white">{totalStories}</span>
              <span className="text-xs text-slate-400">Summarized</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Verified True (80%+)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">{verifiedCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Avg. Corroboration Score
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-indigo-400">{avgAccuracy}%</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <FilterBar filter={filter} onChange={setFilter} totalPosts={posts.length} />

        {/* Posts Grid Feed */}
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 bg-slate-800 rounded"></div>
                    <div className="w-20 h-3 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                <div className="h-28 bg-slate-800 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <FilterX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No matching stories found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Try adjusting your category, platform, or accuracy filter, or ingest a new post.
            </p>
            <button
              onClick={() => setFilter({ category: 'all', platform: 'all', minAccuracy: 0, searchQuery: '', status: 'all' })}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onOpenFactCheck={(report) => setSelectedReport(report)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Fact Check Modal */}
      <FactCheckModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* Ingest Custom Post Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onPostCreated={fetchPosts}
      />

      {/* Monitored Creators Modal */}
      <CreatorsModal
        isOpen={isCreatorsOpen}
        onClose={() => setIsCreatorsOpen(false)}
        onCreatorsUpdated={fetchPosts}
      />

      {/* Floating Quick-Verify Assistant */}
      <FloatingWindow
        isOpen={isFloatingOpen}
        onClose={() => setIsFloatingOpen(false)}
        onPostVerified={() => fetchPosts()}
      />
    </div>
  );
}
