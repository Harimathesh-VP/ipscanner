import { ApiRequester } from '@/components/dashboard/api-requester';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Threat Intelligence Center</h1>
        <p className="text-muted-foreground">
          Query various threat intelligence services in real-time.
        </p>
      </div>
      <ApiRequester />
    </div>
  );
}
