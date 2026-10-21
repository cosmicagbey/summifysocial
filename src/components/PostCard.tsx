'use client';

import React, { useState } from 'react';
import { Post, FactCheckReport } from '@/types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Share2, 
  Heart, 
  MessageCircle,
  Sparkles,
  Link2
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onOpenFactCheck: (report: FactCheckReport) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenFactCheck }) => {
  const [showOriginal, setShowOriginal] = useState(false);

  const formatPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return { label: 'X', bg: 'bg-black text-white border-slate-700' };
      case 'facebook':
        return { label: 'Facebook', bg: 'bg-blue-600 text-white border-blue-500' };
      case 'tiktok':
        return { label: 'TikTok', bg: 'bg-pink-600 text-white border-pink-500' };
      case 'youtube':
        return { label: 'YouTube', bg: 'bg-red-600 text-white border-red-500' };
      case 'reddit':
        return { label: 'Reddit', bg: 'bg-orange-600 text-white border-orange-500' };
      default:
        return { label: platform.toUpperCase(), bg: 'bg-slate-700 text-white border-slate-600' };
    }
  };

  const platformBadge = formatPlatformBadge(post.platform);
  const score = post.factCheck.accuracyScore;

  const getScoreBadge = (val: number) => {
    if (val >= 80) {
      return {
        label: `${val}% Verified`,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25',
      };
    }
    if (val >= 50) {
      return {
        label: `${val}% Developing`,
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25',
      };
    }
    return {
      label: `${val}% Misleading`,
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25',
    };
  };

  const scoreBadge = getScoreBadge(score);

  const formatTimestamp = (dateString: string) => {
    try {
      const diffMs = Date.now() - new Date(dateString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <article className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top Header: Creator details + Platform + Fact Check Badge */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-800/60 flex items-start justify-between gap-3">
        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatarUrl}
            alt={post.author.name}
            className="w-11 h-11 rounded-full object-cover border border-slate-700/80 shadow-inner"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
              )}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${platformBadge.bg}`}>
                {platformBadge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{post.author.handle}</span>
              <span>•</span>
              <span className="capitalize text-slate-300">{post.category}</span>
              <span>•</span>
              <span>{formatTimestamp(post.publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Fact-Check Accuracy Pill */}
        <button
          onClick={() => onOpenFactCheck(post.factCheck)}
          title="Click to view detailed online fact-check and source evidence"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${scoreBadge.badgeClass}`}
        >
          {scoreBadge.icon}
          <span>{scoreBadge.label}</span>
          <span className="text-[10px] underline ml-0.5 opacity-80 hidden sm:inline">Audit</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4 flex-1">
        {/* AI Summary Box */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Summarized Highlights</span>
          </div>
          <p className="text-slate-100 text-sm leading-relaxed font-normal">
            {post.summary}
          </p>

          {/* Key Bullet Takeaways */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <ul className="space-y-1.5 bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300">
              {post.keyTakeaways.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold mt-0.5">•</span>
                  <span className="leading-snug">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Embedded Media / Photo */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/40 relative aspect-video max-h-72">
            <img
              src={post.mediaUrls[0]}
              alt="Media from social post"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Expandable Raw Original Post Toggle */}
        <div className="border-t border-slate-800/60 pt-3">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Link2 className="w-3.5 h-3.5" />
              {showOriginal ? 'Hide original social media post' : 'Show original social media post'}
            </span>
            {showOriginal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showOriginal && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic leading-relaxed animate-in fade-in">
              &ldquo;{post.originalContent}&rdquo;
            </div>
          )}
        </div>
      </div>

      {/* Footer Bar: External Link & Engagement Stats */}
      <div className="px-4 sm:px-5 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <a
          href={post.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View on {platformBadge.label}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1 hover:text-slate-200 transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span>{post.engagement.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-slate-200 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            <span>{post.engagement.shares.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-slate-200 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.engagement.comments.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
