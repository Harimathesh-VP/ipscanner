import { ReportGenerator } from '@/components/dashboard/report-generator';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">AI Report Generator</h1>
        <p className="text-muted-foreground">
          Generate visualizations from your threat intelligence data using AI.
        </p>
      </div>
      <ReportGenerator />
    </div>
  );
}
