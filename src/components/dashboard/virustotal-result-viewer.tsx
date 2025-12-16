'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ShieldQuestion,
  BookCopy,
  Network,
  ShieldCheck,
  Copy,
  Eye,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

type AnalysisResult = {
  category: string;
  engine_name: string;
  method: string;
  result: string | null;
};

type AnalysisStats = {
  harmless: number;
  malicious: number;
  suspicious: number;
  timeout: number;
  undetected: number;
};

type VirusTotalResult = {
  data?: {
    attributes?: {
      last_analysis_results?: Record<string, AnalysisResult>;
      last_analysis_stats?: AnalysisStats;
    };
  };
};

interface VirusTotalResultViewerProps {
  result: VirusTotalResult;
}

export function VirusTotalResultViewer({ result }: VirusTotalResultViewerProps) {
  const { toast } = useToast();

  const analysisResults = useMemo(() => {
    const results = result?.data?.attributes?.last_analysis_results;
    if (!results) return null;

    const categorized = {
      malicious: [] as AnalysisResult[],
      suspicious: [] as AnalysisResult[],
      clean: [] as AnalysisResult[],
      unrated: [] as AnalysisResult[],
    };

    for (const engine in results) {
      const res = results[engine];
      if (res.category === 'malicious') {
        categorized.malicious.push(res);
      } else if (res.category === 'suspicious') {
        categorized.suspicious.push(res);
      } else if (res.category === 'harmless' || res.category === 'clean') {
        categorized.clean.push(res);
      } else {
        categorized.unrated.push(res);
      }
    }
    return categorized;
  }, [result]);
  
  const handleCopyJson = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast({
      title: 'Copied to Clipboard',
      description: 'The JSON response has been copied.',
    });
  };

  if (!analysisResults) {
    return <p>No analysis results available.</p>;
  }

  const { malicious, suspicious, clean, unrated } = analysisResults;

  const renderVendorList = (vendors: AnalysisResult[], columns: 1 | 2 = 1) => {
     return (
        <div className={`grid ${columns === 2 ? 'md:grid-cols-2' : 'grid-cols-1'} gap-x-6 gap-y-2`}>
            {vendors.map((vendor) => (
                <div key={vendor.engine_name} className="flex justify-between items-center text-sm py-1 border-b border-border/50">
                    <span className="text-foreground/80">{vendor.engine_name}</span>
                    {vendor.result && <span className="text-muted-foreground font-mono text-xs">{vendor.result}</span>}
                </div>
            ))}
        </div>
     )
  };


  return (
    <Tabs defaultValue="vendors" className="mt-4">
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-3 w-auto">
          <TabsTrigger value="vendors"><ShieldCheck className="mr-2" /> Security Vendors</TabsTrigger>
          <TabsTrigger value="network" disabled><Network className="mr-2" /> Network Info</TabsTrigger>
          <TabsTrigger value="whois" disabled><BookCopy className="mr-2" /> WHOIS</TabsTrigger>
        </TabsList>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyJson(result)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View Raw JSON</span>
         </Button>
      </div>

      <TabsContent value="vendors" className="space-y-4 pt-4">
        <div className="grid md:grid-cols-2 gap-4">
           {malicious.length > 0 && (
            <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <AlertTriangle /> Malicious / Malware ({malicious.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderVendorList(malicious)}
                </CardContent>
            </Card>
           )}
           {suspicious.length > 0 && (
            <Card className="border-accent/50 bg-accent/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-accent-foreground">
                        <ShieldAlert /> Suspicious ({suspicious.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderVendorList(suspicious)}
                </CardContent>
            </Card>
           )}
        </div>
        
        {clean.length > 0 && (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-green-600">
                        <CheckCircle /> Clean / Harmless ({clean.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderVendorList(clean, 2)}
                </CardContent>
            </Card>
        )}
        
        {unrated.length > 0 && (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                        <ShieldQuestion /> Unrated / Undetected ({unrated.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderVendorList(unrated, 2)}
                </CardContent>
            </Card>
        )}
        
      </TabsContent>
    </Tabs>
  );
}
