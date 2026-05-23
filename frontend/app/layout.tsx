import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MindMesh — AI-powered DSA cockpit',
  description: 'MindMesh is the AI-powered DSA cockpit for tracking LeetCode, Codeforces, CodeChef, GFG progress, notes, editor, dry-runs, and analytics.',
  keywords: ['MindMesh', 'DSA', 'LeetCode', 'Codeforces', 'competitive programming', 'algorithm tracker', 'code editor'],
  openGraph: {
    title: 'MindMesh — AI-powered DSA cockpit',
    description: 'Your AI-powered competitive programming hub',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a26',
                color: '#f0f0f8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a1a26' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a26' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
