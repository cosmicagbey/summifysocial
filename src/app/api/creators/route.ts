import { NextRequest, NextResponse } from 'next/server';
import { getCreators, addCreator } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const creators = getCreators();
    return NextResponse.json({ success: true, count: creators.length, creators });
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch creators' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, handle, platform, category, avatarUrl, feedUrl } = body;

    if (!name || !handle || !platform || !category) {
      return NextResponse.json(
        { success: false, error: 'Name, handle, platform, and category are required' },
        { status: 400 }
      );
    }

    const created = addCreator({
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      platform,
      category,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      active: true,
      feedUrl,
    });

    return NextResponse.json({ success: true, creator: created }, { status: 201 });
  } catch (error) {
    console.error('Error adding creator:', error);
    return NextResponse.json({ success: false, error: 'Failed to add creator' }, { status: 500 });
  }
}
