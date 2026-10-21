import { NextRequest, NextResponse } from 'next/server';
import { Platform, Post, Category } from '@/types';
import { summarizeContent } from '@/lib/summarizer';
import { factCheckContent } from '@/lib/factchecker';
import { addPost } from '@/lib/store';

export const dynamic = 'force-dynamic';

function detectPlatformFromUrl(url: string): Platform {
  const lower = url.toLowerCase();
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('reddit.com')) return 'reddit';
  return 'rss';
}

function extractSimulatedPostFromUrl(url: string, platform: Platform): {
  authorName: string;
  authorHandle: string;
  category: Category;
  content: string;
  mediaUrl: string;
} {
  const lower = url.toLowerCase();

  // Tech / AI detection in URL
  if (lower.includes('apple') || lower.includes('iphone') || lower.includes('openai') || lower.includes('nvidia') || lower.includes('tech')) {
    return {
      authorName: platform === 'twitter' ? 'Tech Radar & Hardware' : 'Tech Insight Daily',
      authorHandle: '@techinsider',
      category: 'tech',
      content: 'Major breakthrough reported in optical interconnect computing for frontier neural networks, cutting inference power consumption by 60% according to newly filed patent documentation.',
      mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    };
  }

  // Sports detection in URL
  if (lower.includes('nba') || lower.includes('fifa') || lower.includes('football') || lower.includes('sports') || lower.includes('transfer')) {
    return {
      authorName: 'Global Sports Center',
      authorHandle: '@globalsports',
      category: 'sports',
      content: 'Breaking: League officials and international federation representatives have officially ratified the 2027 cross-continental club showcase in Paris.',
      mediaUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
    };
  }

  // Science / Space detection
  if (lower.includes('space') || lower.includes('nasa') || lower.includes('star') || lower.includes('science')) {
    return {
      authorName: 'Astro Science Watch',
      authorHandle: '@astroscience',
      category: 'science',
      content: 'Spectroscopic analysis from deep space orbital observatories has corroborated significant carbon dioxide and water vapor atmospheric traces on candidate habitable exoplanets.',
      mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
    };
  }

  // Default viral claim for generic social media links
  return {
    authorName: platform === 'tiktok' ? 'Trending Clips Today' : `${platform.toUpperCase()} Viral Hub`,
    authorHandle: `@viral_${platform}`,
    category: 'tech',
    content: `Verified story linked from ${platform.toUpperCase()}: Circulating viral claims regarding newly announced technologies and global events have been retrieved and evaluated against primary journalism records.`,
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, rawContent } = body;

    if (!url && !rawContent) {
      return NextResponse.json(
        { success: false, error: 'A valid social media URL or post content is required' },
        { status: 400 }
      );
    }

    const platform = url ? detectPlatformFromUrl(url) : 'twitter';
    const simulated = extractSimulatedPostFromUrl(url || '', platform);
    const contentToVerify = rawContent || simulated.content;

    const { summary, keyTakeaways, category } = summarizeContent(contentToVerify, simulated.category);
    const factCheck = await factCheckContent(contentToVerify, category, simulated.authorHandle);

    const post: Post = {
      id: `verify-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      platform,
      author: {
        name: simulated.authorName,
        handle: simulated.authorHandle,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        verified: true,
        followers: '850K',
      },
      category,
      originalContent: contentToVerify,
      summary,
      keyTakeaways,
      mediaUrls: [simulated.mediaUrl],
      originalUrl: url || 'https://x.com/trending/post/10029',
      publishedAt: new Date().toISOString(),
      factCheck,
      engagement: {
        likes: Math.floor(Math.random() * 8000) + 500,
        shares: Math.floor(Math.random() * 2000) + 120,
        comments: Math.floor(Math.random() * 600) + 40,
      },
    };

    // Store in feed database
    addPost(post);

    return NextResponse.json({
      success: true,
      post,
      verification: {
        accuracyScore: factCheck.accuracyScore,
        verdict: factCheck.verdict,
        claim: factCheck.extractedClaim,
        summary,
        evidenceCount: factCheck.evidence.length,
        sources: factCheck.evidence.map(e => ({
          name: e.sourceName,
          domain: e.sourceDomain,
          url: e.url,
          stance: e.stance,
          reliability: e.reliabilityScore,
        })),
      },
    });
  } catch (error) {
    console.error('Error verifying link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify link' },
      { status: 500 }
    );
  }
}
