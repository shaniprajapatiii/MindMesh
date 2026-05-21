'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error');
  const messages: Record<string, string> = {
    OAuthSignin: 'Error starting Google sign in. Try again.',
    OAuthCallback: 'Error during Google sign in. Try again.',
    OAuthAccountNotLinked: 'This email is already registered with a different method.',
    CredentialsSignin: 'Invalid email or password.',
    default: 'An authentication error occurred.',
  };
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-white font-bold text-xl mb-2">Authentication Error</h2>
        <p className="text-gray-400 text-sm mb-6">{messages[error || 'default'] || messages.default}</p>
        <Link href="/auth/login" className="btn btn-primary w-full">Try Again</Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return <Suspense fallback={null}><ErrorContent /></Suspense>;
}
