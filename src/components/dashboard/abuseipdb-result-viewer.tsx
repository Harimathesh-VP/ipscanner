'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  BookCopy,
  Building,
  Calendar,
  Globe,
  HardDrive,
  List,
  Fingerprint,
  Users,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

type Report = {
  reportedAt: string;
  comment: string;
  reporterId: number;
  reporterCountryCode: string;
  reporterCountryName: string;
};

type AbuseIPDBResult = {
  data?: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean | null;
    abuseConfidenceScore: number;
    countryCode: string;
    countryName: string;
    usageType: string;
    isp: string;
    domain: string;
    hostnames: string[];
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string;
    reports: Report[];
    whois: string;
  };
  error?: string;
};

interface AbuseIPDBResultViewerProps {
  result: AbuseIPDBResult;
}

export function AbuseIPDBResultViewer({ result }: AbuseIPDBResultViewerProps) {
  const data = result?.data;

  const scoreColor = useMemo(() => {
    if (!data) return 'bg-gray-500';
    if (data.abuseConfidenceScore > 75) return 'bg-destructive';
    if (data.abuseConfidenceScore > 25) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [data]);
  
  if (!data) {
     return <p className="text-muted-foreground text-center py-4">{result?.error || "No data available."}</p>
  }
  
  const hasWhois = !!data.whois;
  const hasReports = data.reports && data.reports.length > 0;

  return (
    <Tabs defaultValue="overview" className="mt-4">
       <TabsList className="grid grid-cols-3 w-auto">
          <TabsTrigger value="overview"><Fingerprint className="mr-2" /> Overview</TabsTrigger>
          <TabsTrigger value="reports" disabled={!hasReports}><List className="mr-2" /> Reports ({data.totalReports || 0})</TabsTrigger>
          <TabsTrigger value="whois" disabled={!hasWhois}><BookCopy className="mr-2" /> WHOIS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Abuse Confidence Score</CardTitle>
                    <CardDescription>
                        A score from 0 to 100, indicating the confidence that this IP is malicious.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold">{data.abuseConfidenceScore}%</span>
                        <Progress value={data.abuseConfidenceScore} indicatorClassName={scoreColor} className="flex-1" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Globe /> Location & Network</CardTitle>
                    </CardHeader>
                     <CardContent className="grid gap-3 text-sm">
                        <div className="flex justify-between"><span>Country</span> <span className="font-medium">{data.countryName} ({data.countryCode})</span></div>
                        <div className="flex justify-between"><span>Domain</span> <span className="font-medium font-code">{data.domain}</span></div>
                        <div className="flex justify-between"><span>ISP</span> <span className="font-medium">{data.isp}</span></div>
                        <div className="flex justify-between"><span>Usage Type</span> <span className="font-medium">{data.usageType}</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><AlertTriangle /> Abuse Reports</CardTitle>
                    </CardHeader>
                     <CardContent className="grid gap-3 text-sm">
                        <div className="flex justify-between"><span>Total Reports</span> <Badge variant="destructive">{data.totalReports}</Badge></div>
                        <div className="flex justify-between"><span>Distinct Users</span> <span className="font-medium">{data.numDistinctUsers}</span></div>
                        {data.lastReportedAt && <div className="flex justify-between"><span>Last Reported</span> <span className="font-medium">{format(new Date(data.lastReportedAt), 'PPp')}</span></div>}
                        <div className="flex justify-between"><span>Whitelisted</span> <span className="font-medium">{data.isWhitelisted === null ? 'N/A' : data.isWhitelisted ? 'Yes' : 'No'}</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><HardDrive /> Hostnames</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.hostnames.length > 0 ? (
                            <ul className="space-y-1 font-code text-sm list-disc pl-5">
                                {data.hostnames.map(h => <li key={h}>{h}</li>)}
                            </ul>
                        ): (
                            <p className="text-sm text-muted-foreground">No hostnames found.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="reports" className="pt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Recent Abuse Reports</CardTitle>
                    <CardDescription>A list of the most recent reports submitted for this IP address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Reporter</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.reports.map((report, index) => (
                                <TableRow key={index}>
                                    <TableCell className="whitespace-nowrap">{format(new Date(report.reportedAt), 'P')}</TableCell>
                                    <TableCell className="text-xs max-w-sm break-words">{report.comment}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">#{report.reporterId}</span>
                                            <span className="text-xs text-muted-foreground">{report.reporterCountryName}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="whois" className="pt-4">
            <Card>
                <CardHeader>
                    <CardTitle>WHOIS Information</CardTitle>
                    <CardDescription>Raw WHOIS data for the IP address.</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.whois ? (
                        <pre className="text-xs font-code overflow-x-auto p-4 bg-muted/50 rounded-md max-h-[600px]">
                            {data.whois}
                        </pre>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No WHOIS data available.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
