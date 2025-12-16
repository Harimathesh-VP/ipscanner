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
} from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';

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

type WhoisData = Record<string, any>;


type VirusTotalResult = {
  data?: {
    attributes?: {
      asn?: number;
      as_owner?: string;
      network?: string;
      country?: string;
      continent?: string;
      last_analysis_results?: Record<string, AnalysisResult>;
      last_analysis_stats?: AnalysisStats;
      resolutions?: NetworkInfo[];
      subdomains?: NetworkInfo[];
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

  const networkInfo = type === 'ip_address' ? attributes?.resolutions : attributes?.subdomains;
  const hasNetworkInfo = (networkInfo && networkInfo.length > 0) || (type === 'ip_address' && attributes?.asn);
  const hasWhois = attributes?.whois && Object.keys(attributes.whois).length > 0;

  return (
    <Tabs defaultValue="vendors" className="mt-4">
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-3 w-auto">
          <TabsTrigger value="vendors"><ShieldCheck className="mr-2" /> Security Vendors</TabsTrigger>
          <TabsTrigger value="network" disabled={!hasNetworkInfo}><Network className="mr-2" /> Network Info</TabsTrigger>
          <TabsTrigger value="whois" disabled={!hasWhois}><BookCopy className="mr-2" /> WHOIS</TabsTrigger>
        </TabsList>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyJson(result)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View Raw JSON</span>
         </Button>
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
        {type === 'ip_address' && attributes?.asn && (
            <Card>
                <CardHeader>
                    <CardTitle>ASN & Network</CardTitle>
                    <CardDescription>Autonomous System and network block information for this IP.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                     <div className="flex items-center gap-3">
                        <Milestone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">ASN</p>
                            <p className="font-medium">{attributes.asn}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Network className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">CIDR / Range</p>
                            <p className="font-medium font-code">{attributes.network}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Owner</p>
                            <p className="font-medium">{attributes.as_owner}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="font-medium">{attributes.country} ({attributes.continent})</p>
                        </div>
                     </div>
                </CardContent>
            </Card>
        )}

        {networkInfo && networkInfo.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>{type === 'ip_address' ? 'DNS Resolutions' : 'Subdomains'}</CardTitle>
                    <CardDescription>
                        {type === 'ip_address' ? 'Hostnames that have resolved to this IP address.' : 'Subdomains discovered for this domain.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{type === 'ip_address' ? 'Hostname' : 'Subdomain'}</TableHead>
                                <TableHead className="text-right">Last Resolved</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {networkInfo?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-mono text-xs">{item.attributes.host_name || item.id}</TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs">
                                        {item.attributes.last_resolved ? new Date(item.attributes.last_resolved * 1000).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
      </TabsContent>
      <TabsContent value="whois" className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle>WHOIS Information</CardTitle>
                <CardDescription>Domain registration and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
                <pre className="text-sm font-code overflow-x-auto bg-muted p-4 rounded-md">
                    {JSON.stringify(attributes?.whois, null, 2)}
                </pre>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
