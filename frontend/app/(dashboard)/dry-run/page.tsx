import { Suspense } from 'react';
import DryRunClient from './DryRunClient';

export default function DryRunPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 max-w-7xl mx-auto text-sm text-gray-500">Loading dry run visualizer...</div>}>
      <DryRunClient />
    </Suspense>
  );
}