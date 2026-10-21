import { NextRequest, NextResponse } from 'next/server';
import { toggleCreator, deleteCreator } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = toggleCreator(params.id);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, creator: updated });
  } catch (error) {
    console.error('Error toggling creator:', error);
    return NextResponse.json({ success: false, error: 'Failed to update creator' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteCreator(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Creator unfollowed' });
  } catch (error) {
    console.error('Error deleting creator:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete creator' }, { status: 500 });
  }
}
