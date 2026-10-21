import { NextResponse } from 'next/server';
import { generateNextLiveUpdate } from '@/lib/feedEngine';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const post = await generateNextLiveUpdate();
    if (!post) {
      return NextResponse.json(
        { success: false, message: 'No active creators found to simulate feed' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Error simulating live update:', error);
    return NextResponse.json({ success: false, error: 'Simulation failed' }, { status: 500 });
  }
}
