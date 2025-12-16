import AppHeader from '@/components/layout/app-header';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ApiKeysProvider } from '@/context/api-keys-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApiKeysProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ApiKeysProvider>
  );
}
