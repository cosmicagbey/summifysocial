'use client';

import React, { useState } from 'react';
import { Platform, Category } from '@/types';
import { X, Sparkles, Check, Globe, Link, Image as ImageIcon } from 'lucide-react';

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [platform, setPlatform] = useState<Platform>('twitter');
  const [category, setCategory] = useState<Category>('tech');
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [content, setContent] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorHandle.trim()) {
      setError('Author handle and post content are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          category,
          authorName: authorName.trim() || authorHandle.trim(),
          authorHandle: authorHandle.trim(),
          content: content.trim(),
          originalUrl: originalUrl.trim() || undefined,
          mediaUrl: mediaUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process post');
      }

      onPostCreated();
      onClose();
      // Reset form
      setContent('');
      setAuthorHandle('');
      setAuthorName('');
      setOriginalUrl('');
      setMediaUrl('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing');
    } finally {
      setLoading(false);
    }
  };

  const handlePreloadSample = (type: 'tech' | 'hoax' | 'sports') => {
    if (type === 'tech') {
      setPlatform('twitter');
      setCategory('tech');
      setAuthorName('Tech Insider');
      setAuthorHandle('@techinsider');
      setContent('NVIDIA has announced its next-generation Blackwell Ultra architecture with 288GB of HBM3e memory, delivering a 4x leap in AI inference throughput.');
      setMediaUrl('https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&auto=format&fit=crop&q=80');
      setOriginalUrl('https://x.com/techinsider/status/987162534');
    } else if (type === 'hoax') {
      setPlatform('tiktok');
      setCategory('science');
      setAuthorName('Viral Mystery Clips');
      setAuthorHandle('@mysteryclips');
      setContent('Scientists have reportedly discovered a secret subterranean ocean underneath Antarctica with prehistoric living dinosaurs that the government is keeping hidden!');
      setMediaUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80');
      setOriginalUrl('https://tiktok.com/@mysteryclips/video/987162534');
    } else {
      setPlatform('facebook');
      setCategory('sports');
      setAuthorName('Global Football Daily');
      setAuthorHandle('@football_daily');
      setContent('Real Madrid has finalized an agreement to sign Kylian Mbappé on a 5-year contract with a signing bonus exceeding €100 million.');
      setMediaUrl('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80');
      setOriginalUrl('https://facebook.com/football_daily/posts/8492049');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white text-base">Fact-Check Any Social Media Content</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Quick Preload buttons */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Quick Test Examples:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handlePreloadSample('tech')}
                className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
              >
                Tech News
              </button>
              <button
                type="button"
                onClick={() => handlePreloadSample('hoax')}
                className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
              >
                Viral Claim
              </button>
              <button
                type="button"
                onClick={() => handlePreloadSample('sports')}
                className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
              >
                Sports Transfer
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Platform & Category Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="twitter">X (Twitter)</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="reddit">Reddit</option>
                <option value="rss">RSS Feed / Web</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="tech">Science & Tech</option>
                <option value="sports">Sports</option>
                <option value="entertainment">Entertainment</option>
                <option value="business">Business & Finance</option>
                <option value="politics">World News & Politics</option>
              </select>
            </div>
          </div>

          {/* Author Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Creator Handle</label>
              <input
                type="text"
                placeholder="@username"
                value={authorHandle}
                onChange={(e) => setAuthorHandle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="Creator / Outlet Name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Social Media Post Content / Headline
            </label>
            <textarea
              rows={4}
              placeholder="Paste the tweet, post text, video description, or news claim here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Links & Media Row */}
          <div className="space-y-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
                <Link className="w-3 h-3 text-slate-400" /> Original Post URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://x.com/user/status/..."
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1">
                <ImageIcon className="w-3 h-3 text-slate-400" /> Image / Media URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Summarizing & Fact-Checking Online Sources...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Summarize & Fact-Check Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
