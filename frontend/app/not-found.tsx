import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="grid-bg fixed inset-0 opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <div className="text-8xl font-display font-black gradient-text mb-4">404</div>
        <h2 className="text-white text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn btn-primary px-6 py-2.5">Go to Dashboard</Link>
          <Link href="/" className="btn btn-secondary px-6 py-2.5">Home</Link>
        </div>
      </div>
    </div>
  );
}
