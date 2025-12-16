import { ReportGenerator } from '@/components/dashboard/report-generator';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Generate Report</h1>
        <p className="text-muted-foreground">
          Create a consolidated threat intelligence report for an indicator.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
