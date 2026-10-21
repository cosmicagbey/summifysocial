export type Platform = 'twitter' | 'facebook' | 'tiktok' | 'youtube' | 'reddit' | 'rss';

export type Category = 'tech' | 'sports' | 'entertainment' | 'politics' | 'business' | 'science';

export type FactCheckStatus = 'verified' | 'unverified' | 'disputed' | 'misleading';

export interface FactCheckEvidence {
  sourceName: string;
  sourceDomain: string;
  url: string;
  title: string;
  snippet: string;
  stance: 'corroborates' | 'refutes' | 'neutral';
  reliabilityScore: number; // 0-100
}

export interface FactCheckReport {
  accuracyScore: number; // 0-100
  status: FactCheckStatus;
  verdict: string;
  extractedClaim: string;
  analysis: string;
  evidence: FactCheckEvidence[];
  verifiedAt: string;
}

export interface Post {
  id: string;
  platform: Platform;
  author: {
    name: string;
    handle: string;
    avatarUrl: string;
    verified?: boolean;
    followers?: string;
  };
  category: Category;
  originalContent: string;
  summary: string;
  keyTakeaways: string[];
  mediaUrls: string[];
  originalUrl: string;
  publishedAt: string;
  factCheck: FactCheckReport;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface FollowedCreator {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  avatarUrl: string;
  category: Category;
  active: boolean;
  feedUrl?: string;
}

export interface AggregatorFilter {
  category: Category | 'all';
  platform: Platform | 'all';
  minAccuracy: number;
  searchQuery: string;
  status: FactCheckStatus | 'all';
}
