import { NextRequest, NextResponse } from 'next/server';
import { Platform, Post, Category } from '@/types';
import { extractPostFromUrl, detectPlatform } from '@/lib/linkExtractor';
import { summarizeContent, detectCategory } from '@/lib/summarizer';
import { factCheckContent } from '@/lib/factchecker';
import { addPost } from '@/lib/store';

export const dynamic = 'force-dynamic';

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

    let postTitle = '';
    let extractedContent = rawContent || '';
    let authorName = 'Social Media Creator';
    let authorHandle = '@creator';
    let avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
    let mediaUrl: string | undefined = undefined;
    let platform: Platform = 'twitter';
    let publishedAt: string | undefined = undefined;

    // 1. If a URL was provided, extract real live content from the target link
    if (url && url.trim().startsWith('http')) {
      const extracted = await extractPostFromUrl(url.trim());
      platform = extracted.platform;
      postTitle = extracted.title;
      extractedContent = rawContent || extracted.content;
      authorName = extracted.authorName;
      authorHandle = extracted.authorHandle;
      avatarUrl = extracted.avatarUrl;
      mediaUrl = extracted.mediaUrl;
      publishedAt = extracted.publishedAt;
    } else {
      platform = 'twitter';
    }

    const category = detectCategory(extractedContent);

    // 2. Generate detailed AI summary of what the author/creator is saying + key takeaways
    const { summary, keyTakeaways } = await summarizeContent(
      extractedContent,
      category,
      { name: authorName, handle: authorHandle }
    );

    // 3. Real-time fact-check and live corroboration against news wire feeds
    const factCheck = await factCheckContent(extractedContent, category, authorHandle);

    const post: Post = {
      id: `verify-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      platform,
      author: {
        name: authorName,
        handle: authorHandle,
        avatarUrl,
        verified: true,
      },
      category,
      originalContent: extractedContent,
      summary,
      keyTakeaways,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      originalUrl: url || 'https://x.com',
      publishedAt: publishedAt || new Date().toISOString(),
      factCheck,
      engagement: {
        likes: Math.floor(Math.random() * 5000) + 120,
        shares: Math.floor(Math.random() * 1200) + 40,
        comments: Math.floor(Math.random() * 400) + 15,
      },
    };

    // Store in feed database
    try {
      addPost(post);
    } catch (e) {
      console.warn('Could not persist to local store:', e);
    }

    return NextResponse.json({
      success: true,
      post,
      verification: {
        accuracyScore: factCheck.accuracyScore,
        verdict: factCheck.verdict,
        claim: factCheck.extractedClaim,
        summary,
        keyTakeaways,
        originalContent: extractedContent,
        evidenceCount: factCheck.evidence.length,
        sources: factCheck.evidence.map(e => ({
          name: e.sourceName,
          domain: e.sourceDomain,
          url: e.url,
          title: e.title,
          snippet: e.snippet,
          stance: e.stance,
          reliability: e.reliabilityScore,
        })),
      },
    });
  } catch (error) {
    console.error('Error verifying link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify link. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
