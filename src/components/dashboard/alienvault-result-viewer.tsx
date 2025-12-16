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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AlienVaultResult = {
  indicator: string;
  type: string;
  reputation?: {
    activities?: {
      name: string;
      description: string;
    }[];
  };
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

  const hasPassiveDns = result.passive_dns?.passive_dns && result.passive_dns.passive_dns.length > 0;
  const hasMalware = result.malware?.data && result.malware.data.length > 0;
  const hasUrlList = result.url_list?.url_list && result.url_list.url_list.length > 0;
  const hasWhois = !!result.whois_data;

  return (
    <Tabs defaultValue="overview" className="mt-4">
      <TabsList className="grid grid-cols-5 w-auto">
        <TabsTrigger value="overview"><Fingerprint className="mr-2" /> Overview</TabsTrigger>
        <TabsTrigger value="passive-dns" disabled={!hasPassiveDns}><CircleDotDashed className="mr-2" /> Passive DNS</TabsTrigger>
        <TabsTrigger value="malware" disabled={!hasMalware}><Bug className="mr-2" /> Malware</TabsTrigger>
        <TabsTrigger value="urls" disabled={!hasUrlList}><LinkIcon className="mr-2" /> URLs</TabsTrigger>
        <TabsTrigger value="whois" disabled={!hasWhois}><BookCopy className="mr-2" /> WHOIS</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Indicator Details</CardTitle>
            <CardDescription>
              General information for <span className="font-mono">{result.indicator}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>Type:</strong> {result.type}</p>
            {result.reputation?.activities && (
              <>
                <h4 className="font-semibold mt-4 mb-2">Reputation Activities:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.reputation.activities.map(activity => (
                    <Badge key={activity.name} variant="destructive">{activity.name}</Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="passive-dns" className="pt-4">
        <Card>
          <CardHeader><CardTitle>Passive DNS</CardTitle></CardHeader>
          <CardContent>
            {hasPassiveDns ? result.passive_dns?.passive_dns?.map((record, index) => (
                <div key={index} className="mb-2 p-2 border-b">
                  <p><strong>Hostname:</strong> {record.hostname}</p>
                  <p><strong>Address:</strong> {record.address}</p>
                  <p><strong>First Seen:</strong> {record.first}</p>
                  <p><strong>Last Seen:</strong> {record.last}</p>
                </div>
            )) : <p>No passive DNS data available.</p>}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="malware" className="pt-4">
        <Card>
            <CardHeader><CardTitle>Associated Malware</CardTitle></CardHeader>
            <CardContent>
               {hasMalware ? result.malware?.data?.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border-b">
                      <p><strong>Hash:</strong> {item.hash}</p>
                      {item.detections && <p><strong>Detections:</strong> {item.detections.join(', ')}</p>}
                    </div>
                )) : <p>No malware data available.</p>}
            </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="urls" className="pt-4">
        <Card>
            <CardHeader><CardTitle>Associated URLs</CardTitle></CardHeader>
            <CardContent>
               {hasUrlList ? result.url_list?.url_list?.map((item, index) => (
                    <div key={index} className="mb-2 p-2 border-b">
                       <p><strong>URL:</strong> {item.url}</p>
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
