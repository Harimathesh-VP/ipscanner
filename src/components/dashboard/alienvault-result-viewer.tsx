'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookCopy,
  Network,
  Fingerprint,
  Bug,
  Link as LinkIcon,
  CircleDotDashed,
  Globe,
  Info,
  ShieldQuestion,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AlienVaultResult = {
  indicator: string;
  type: string;
  type_title: string;
  reputation?: number;
  asn?: string;
  country_name?: string;
  city?: string;
  pulse_info?: {
    count: number;
    pulses?: {
      name: string;
      description: string;
      tags: string[];
      references: string[];
      adversary: string;
    }[];
  };
  sections: string[];
  passive_dns?: {
    passive_dns?: {
      address: string;
      hostname: string;
      first: string;
      last: string;
    }[];
  };
  malware?: {
    data?: {
      hash: string;
      detections: string[];
    }[];
  };
  url_list?: {
    url_list?: {
      url: string;
      date: string;
    }[];
  };
  whois_data?: string;
  error?: string;
};

interface AlienVaultResultViewerProps {
  result: AlienVaultResult;
}

export function AlienVaultResultViewer({ result }: AlienVaultResultViewerProps) {
  if (result.error) {
    return <p className="text-muted-foreground text-center py-4">{result.error}</p>;
  }

  const hasSection = (section: string) => result.sections?.includes(section);
  const hasPassiveDns = hasSection('passive_dns') && result.passive_dns?.passive_dns && result.passive_dns.passive_dns.length > 0;
  const hasMalware = hasSection('malware') && result.malware?.data && result.malware.data.length > 0;
  const hasUrlList = hasSection('url_list') && result.url_list?.url_list && result.url_list.url_list.length > 0;
  const hasWhois = !!result.whois_data;
  const hasGeo = hasSection('geo') && (result.country_name || result.city);
  const hasPulses = result.pulse_info && result.pulse_info.count > 0;

  return (
    <Tabs defaultValue="overview" className="mt-4">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
        <TabsTrigger value="overview"><Fingerprint className="mr-2" /> Overview</TabsTrigger>
        <TabsTrigger value="passive-dns" disabled={!hasPassiveDns}><CircleDotDashed className="mr-2" /> Passive DNS</TabsTrigger>
        <TabsTrigger value="malware" disabled={!hasMalware}><Bug className="mr-2" /> Malware</TabsTrigger>
        <TabsTrigger value="urls" disabled={!hasUrlList}><LinkIcon className="mr-2" /> URLs</TabsTrigger>
        <TabsTrigger value="whois" disabled={!hasWhois}><BookCopy className="mr-2" /> WHOIS</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="pt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>OTX Summary</CardTitle>
            <CardDescription>
              General information for <span className="font-mono">{result.indicator}</span> ({result.type_title})
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <ShieldQuestion className="text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Reputation</p>
                        <p className="font-semibold">{result.reputation ?? 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Users className="text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">ASN</p>
                        <p className="font-semibold font-code">{result.asn?.replace('AS', '') || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <AlertTriangle className="text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Pulses</p>
                        <p className="font-semibold">{result.pulse_info?.count || 0}</p>
                    </div>
                </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-4">
            {hasGeo && <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Globe /> Geolocation</CardTitle>
                </CardHeader>
                 <CardContent className="grid gap-3 text-sm">
                    <div className="flex justify-between"><span>Country</span> <span className="font-medium">{result.country_name}</span></div>
                    <div className="flex justify-between"><span>City</span> <span className="font-medium">{result.city || 'N/A'}</span></div>
                </CardContent>
            </Card>}

            {hasPulses && <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><AlertTriangle /> Threat Pulses</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-2">
                    {result.pulse_info?.pulses?.slice(0, 3).map((pulse, index) => (
                        <div key={index} className="text-xs border-b pb-2">
                           <p className="font-semibold text-primary">{pulse.name}</p>
                           <p className="text-muted-foreground truncate">{pulse.description}</p>
                           <div className="flex flex-wrap gap-1 mt-1">
                               {pulse.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                           </div>
                        </div>
                    ))}
                     {result.pulse_info!.count > 3 && <p className="text-xs text-muted-foreground text-center pt-2">And {result.pulse_info!.count - 3} more...</p>}
                </CardContent>
            </Card>}
        </div>
      </TabsContent>

      <TabsContent value="passive-dns" className="pt-4">
        <Card>
          <CardHeader>
              <CardTitle>Passive DNS</CardTitle>
              <CardDescription>Historical DNS resolutions for this indicator.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPassiveDns ? result.passive_dns?.passive_dns?.map((record, index) => (
                <div key={index} className="mb-3 p-3 border-b text-sm">
                  <p><strong>Hostname:</strong> <span className="font-code">{record.hostname}</span></p>
                  <p><strong>Address:</strong> <span className="font-code">{record.address}</span></p>
                  <p><strong>First Seen:</strong> {record.first}</p>
                  <p><strong>Last Seen:</strong> {record.last}</p>
                </div>
            )) : <p>No passive DNS data available.</p>}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="malware" className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle>Associated Malware</CardTitle>
                <CardDescription>Malware samples associated with this indicator.</CardDescription>
            </CardHeader>
            <CardContent>
               {hasMalware ? result.malware?.data?.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border-b">
                      <p><strong>Hash:</strong> <span className="font-code">{item.hash}</span></p>
                      {item.detections && <p><strong>Detections:</strong> {item.detections.join(', ')}</p>}
                    </div>
                )) : <p>No malware data available.</p>}
            </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="urls" className="pt-4">
        <Card>
            <CardHeader>
                <CardTitle>Associated URLs</CardTitle>
                <CardDescription>URLs found to be related to this indicator.</CardDescription>
            </CardHeader>
            <CardContent>
               {hasUrlList ? result.url_list?.url_list?.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border-b">
                       <p><strong>URL:</strong> <span className="font-code">{item.url}</span></p>
                       <p><strong>Date:</strong> {item.date}</p>
                    </div>
                )) : <p>No URL data available.</p>}
            </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="whois" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>WHOIS Information</CardTitle>
            <CardDescription>Registration data for the indicator, if available.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasWhois ? (
              <pre className="text-xs font-code overflow-x-auto p-4 bg-muted/50 rounded-md max-h-[600px]">
                {result.whois_data}
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
