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
  Eye,
  Globe,
  Milestone,
  CalendarClock,
  Pencil,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


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

type NetworkInfo = {
    attributes: {
        host_name?: string;
        last_resolved?: number;
        ip_address?: string;
    };
    id: string;
}

type WhoisData = Record<string, any> | string;


type VirusTotalResult = {
  data?: {
    attributes?: {
      asn?: number;
      as_owner?: string;
      network?: string;
      country?: string;
      continent?: string;
      last_analysis_date?: number;
      last_modification_date?: number;
      last_analysis_results?: Record<string, AnalysisResult>;
      last_analysis_stats?: AnalysisStats;
      whois?: WhoisData;
    };
    type?: 'ip_address' | 'domain' | 'url';
  };
};

interface VirusTotalResultViewerProps {
  result: VirusTotalResult;
}

export function VirusTotalResultViewer({ result }: VirusTotalResultViewerProps) {
  const { toast } = useToast();
  const attributes = result?.data?.attributes;
  const type = result?.data?.type;

  const analysisResults = useMemo(() => {
    const results = attributes?.last_analysis_results;
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
  }, [attributes]);
  
  const handleCopyJson = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast({
      title: 'Copied to Clipboard',
      description: 'The JSON response has been copied.',
    });
  };

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

  const hasNetworkInfo = !!(attributes?.asn || attributes?.last_analysis_date || attributes?.last_modification_date);
  const hasWhois = attributes?.whois && (typeof attributes.whois === 'string' || Object.keys(attributes.whois).length > 0);
  
  const whoisContent = useMemo(() => {
    if (!hasWhois) return null;
    if (typeof attributes.whois === 'string') {
        return attributes.whois;
    }
    // Pretty print object
    return Object.entries(attributes.whois)
      .map(([key, value]) => `${key.padEnd(20)}: ${value}`)
      .join('\n');
  }, [attributes?.whois, hasWhois]);


  return (
    <Tabs defaultValue="vendors" className="mt-4">
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-3 w-auto">
          <TabsTrigger value="vendors"><ShieldCheck className="mr-2" /> Security Vendors</TabsTrigger>
          <TabsTrigger value="network" disabled={!hasNetworkInfo}><Network className="mr-2" /> Details</TabsTrigger>
          <TabsTrigger value="whois" disabled={!hasWhois}><BookCopy className="mr-2" /> WHOIS</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="vendors" className="space-y-4 pt-4">
        {!analysisResults ? (
             <p className="text-muted-foreground text-center py-4">No analysis results available.</p>
        ) : (
            <>
                <div className="grid md:grid-cols-2 gap-4">
                   {analysisResults.malicious.length > 0 && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-destructive">
                                <AlertTriangle /> Malicious / Malware ({analysisResults.malicious.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderVendorList(analysisResults.malicious)}
                        </CardContent>
                    </Card>
                   )}
                   {analysisResults.suspicious.length > 0 && (
                    <Card className="border-accent/50 bg-accent/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-accent-foreground">
                                <ShieldAlert /> Suspicious ({analysisResults.suspicious.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderVendorList(analysisResults.suspicious)}
                        </CardContent>
                    </Card>
                   )}
                </div>
                
                {analysisResults.clean.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-green-600">
                                <CheckCircle /> Clean / Harmless ({analysisResults.clean.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderVendorList(analysisResults.clean, 2)}
                        </CardContent>
                    </Card>
                )}
                
                {analysisResults.unrated.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                                <ShieldQuestion /> Unrated / Undetected ({analysisResults.unrated.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderVendorList(analysisResults.unrated, 2)}
                        </CardContent>
                    </Card>
                )}
            </>
        )}
        
      </TabsContent>
       <TabsContent value="network" className="pt-4 space-y-4">
        {hasNetworkInfo ? (
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Network, location, and analysis date information.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                     {attributes?.asn && <div className="flex items-center gap-3">
                        <Milestone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">ASN</p>
                            <p className="font-medium">{attributes.asn}</p>
                        </div>
                     </div>}
                     {attributes?.network && <div className="flex items-center gap-3">
                        <Network className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">CIDR / Range</p>
                            <p className="font-medium font-code">{attributes.network}</p>
                        </div>
                     </div>}
                     {attributes?.as_owner && <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Owner</p>
                            <p className="font-medium">{attributes.as_owner}</p>
                        </div>
                     </div>}
                     {attributes?.country && <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium">{attributes.country} ({attributes.continent})</p>
                        </div>
                     </div>}
                     {attributes?.last_analysis_date && <div className="flex items-center gap-3">
                        <CalendarClock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Last Analysis</p>
                            <p className="font-medium">{format(new Date(attributes.last_analysis_date * 1000), 'PPpp')}</p>
                        </div>
                     </div>}
                      {attributes?.last_modification_date && <div className="flex items-center gap-3">
                        <Pencil className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Last Modification</p>
                            <p className="font-medium">{format(new Date(attributes.last_modification_date * 1000), 'PPpp')}</p>
                        </div>
                     </div>}
                </CardContent>
            </Card>
        ): (
            <p className="text-muted-foreground text-center py-4">No detailed information available.</p>
        )}
      </TabsContent>
      <TabsContent value="whois" className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle>WHOIS Information</CardTitle>
                <CardDescription>Domain registration and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
                {whoisContent ? (
                    <pre className="text-sm font-code overflow-x-auto p-4 bg-muted/50 rounded-md max-h-[600px]">
                        {whoisContent}
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
