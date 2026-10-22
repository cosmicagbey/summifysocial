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

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.closePanel) {
      (window as any).AndroidBridge.closePanel();
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <FloatingWindow
        isOpen={isOpen}
        onClose={handleClose}
        initialUrl={initialUrl}
        isStandalone={true}
      />
      {!isOpen && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <p className="text-sm">Verifier panel minimized.</p>
          <button
            onClick={() => setIsOpen(true)}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Reopen Verifier
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
    <div className="w-full h-screen bg-slate-950 flex flex-col overflow-hidden">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <p className="text-xs">Loading verifier...</p>
        </div>
      }>
        <FloatingContent />
      </Suspense>
    </div>
  );
}
