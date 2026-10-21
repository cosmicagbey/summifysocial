'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FloatingWindow } from '@/components/FloatingWindow';

/**
 * Inner component that uses useSearchParams — must be wrapped in Suspense.
 */
function FloatingContent() {
  const [isOpen, setIsOpen] = useState(true);
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get('url') || '';

  return (
    <div className="w-full max-w-md">
      <FloatingWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialUrl={initialUrl}
      />
      {!isOpen && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Floating Assistant closed.</p>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Reopen Assistant
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Standalone /floating route — used by the Android floating bubble WebView.
 * Reads ?url= query param to auto-verify a clipboard-detected social link.
 */
export default function FloatingPage() {
  return (
    <div className="min-h-screen bg-slate-950/90 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">Loading verifier...</p>
        </div>
      }>
        <FloatingContent />
      </Suspense>
    </div>
  );
}
