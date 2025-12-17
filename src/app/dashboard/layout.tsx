import AppHeader from '@/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ApiKeysProvider } from '@/context/api-keys-context';
import { DashboardClientLayout } from '@/components/layout/dashboard-client-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApiKeysProvider>
      <SidebarProvider>
        <DashboardClientLayout>
          <AppHeader />
          <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
        </DashboardClientLayout>
      </SidebarProvider>
    </ApiKeysProvider>
  );
}
