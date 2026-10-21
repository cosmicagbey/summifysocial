import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SummifySocial - AI Social News & Fact-Checked Feed',
  description: 'Consolidated real-time feed of followed creators across X, Facebook, TikTok & news outlets, summarized and fact-checked via online sources.',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
