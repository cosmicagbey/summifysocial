import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/lib/store';
import { processAndIngestPost } from '@/lib/feedEngine';
import { FollowedCreator } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const platform = searchParams.get('platform');
    const minAccuracy = searchParams.get('minAccuracy');
    const query = searchParams.get('query');

    let posts = getPosts();

    if (category && category !== 'all') {
      posts = posts.filter(p => p.category === category);
    }

    if (platform && platform !== 'all') {
      posts = posts.filter(p => p.platform === platform);
    }

    if (minAccuracy) {
      const min = parseInt(minAccuracy, 10);
      if (!isNaN(min)) {
        posts = posts.filter(p => p.factCheck.accuracyScore >= min);
      }
    }

    if (query) {
      const q = query.toLowerCase();
      posts = posts.filter(
        p =>
          p.originalContent.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          p.author.handle.toLowerCase().includes(q) ||
          p.factCheck.extractedClaim.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error('API Error fetching posts:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authorName, authorHandle, platform, content, originalUrl, mediaUrl, category } = body;

    if (!content || !authorHandle) {
      return NextResponse.json(
        { success: false, error: 'Content and author handle are required' },
        { status: 400 }
      );
    }

    const creator: FollowedCreator = {
      id: `custom-${Date.now()}`,
      name: authorName || authorHandle,
      handle: authorHandle.startsWith('@') ? authorHandle : `@${authorHandle}`,
      platform: platform || 'twitter',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      category: category || 'tech',
      active: true,
    };

    const mediaList = mediaUrl ? [mediaUrl] : [];
    const newPost = await processAndIngestPost(
      creator,
      content,
      mediaList,
      originalUrl || `https://${creator.platform}.com/${creator.handle}/post/${Date.now()}`
    );

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error('API Error processing custom post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to summarize and fact check post' },
      { status: 500 }
    );
  }
}
