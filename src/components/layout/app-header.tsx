'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export default function AppHeader() {
  const pathname = usePathname();
  
  const getTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'dashboard';
    
    if (lastSegment === 'dashboard') return 'Dashboard';
    
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold font-headline">{getTitle()}</h1>
      </div>
    </header>
  );
}
