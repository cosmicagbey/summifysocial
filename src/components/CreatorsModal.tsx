'use client';

import React, { useState, useEffect } from 'react';
import { FollowedCreator, Platform, Category } from '@/types';
import { X, Users, UserPlus, Check, Trash2, Power, Plus } from 'lucide-react';

interface CreatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatorsUpdated: () => void;
}

export const CreatorsModal: React.FC<CreatorsModalProps> = ({
  isOpen,
  onClose,
  onCreatorsUpdated,
}) => {
  const [creators, setCreators] = useState<FollowedCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New creator form state
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [category, setCategory] = useState<Category>('tech');

  useEffect(() => {
    if (isOpen) {
      fetchCreators();
    }
  }, [isOpen]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      if (data.success) {
        setCreators(data.creators);
      }
    } catch (err) {
      console.error('Failed to load creators:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/creators/${id}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setCreators((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
        );
        onCreatorsUpdated();
      }
    } catch (err) {
      console.error('Failed to toggle creator:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/creators/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCreators((prev) => prev.filter((c) => c.id !== id));
        onCreatorsUpdated();
      }
    } catch (err) {
      console.error('Failed to delete creator:', err);
    }
  };

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) return;

    try {
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim(),
          platform,
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreators((prev) => [...prev, data.creator]);
        setShowAddForm(false);
        setName('');
        setHandle('');
        onCreatorsUpdated();
      }
    } catch (err) {
      console.error('Failed to add creator:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-white text-base">Followed Creators & News Channels</h3>
              <p className="text-xs text-slate-400">Summify monitors these feeds and delivers real-time fact-checked summaries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Add creator toggle banner */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Monitored Sources ({creators.filter(c => c.active).length} of {creators.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all"
            >
              {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAddForm ? 'Cancel' : 'Follow New Creator'}</span>
            </button>
          </div>

          {/* Add Creator Form */}
          {showAddForm && (
            <form onSubmit={handleAddCreator} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Follow a Creator or Outlet</h4>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Creator Name (e.g. Neil deGrasse Tyson)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Handle (e.g. @neiltyson)"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="twitter">X (Twitter)</option>
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="reddit">Reddit</option>
                  <option value="rss">RSS Feed / Web</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="tech">Science & Tech</option>
                  <option value="science">Science & Space</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="business">Business & Finance</option>
                  <option value="politics">World News & Politics</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Follow Account
              </button>
            </form>
          )}

          {/* Creators List */}
          <div className="space-y-2">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  creator.active
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{creator.name}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {creator.platform}
                      </span>
                      <span className="text-[10px] capitalize text-slate-400">
                        ({creator.category})
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{creator.handle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(creator.id)}
                    title={creator.active ? 'Pause monitoring' : 'Resume monitoring'}
                    className={`p-2 rounded-lg transition-colors border ${
                      creator.active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(creator.id)}
                    title="Unfollow"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Real-time feed ingests incoming stories from active creators
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
