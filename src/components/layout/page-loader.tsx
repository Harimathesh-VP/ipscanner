'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30); // Initial progress
    const timer = setTimeout(() => setProgress(80), 50); // Simulate loading
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // This effect runs when the component mounts and is assumed to be
    // after the new page content has started rendering.
    const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(() => setLoading(false), 300); // Hide after completion
    }, 150);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);


  if (!loading) return null;

  return (
    <Progress
      value={progress}
      className="absolute top-0 left-0 right-0 h-0.5 rounded-none bg-transparent"
    />
  );
}
