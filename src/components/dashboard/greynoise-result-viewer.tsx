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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Globe,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Calendar,
  Building,
  Tag,
  ShieldQuestion,
  ToggleLeft,
  Server,
} from 'lucide-react';

type GreyNoiseResult = {
  ip: string;
  noise: boolean;
  riot: boolean;
  classification: 'malicious' | 'benign' | 'unknown';
  name: string;
  link: string;
  last_seen: string;
  first_seen: string;
  actor: string;
  organization: string;
  tags: string[];
  vpn: boolean;
  vpn_service: string;
  metadata: {
    country: string;
    country_code: string;
    city: string;
    organization: string;
    asn: string;
    rdns: string;
  };
  raw_data: {
    scan: any[];
    web: any;
    ja3: any[];
    hassh: any[];
  };
  message?: string;
  error?: string;
};

interface GreyNoiseResultViewerProps {
  result: GreyNoiseResult;
}

export function GreyNoiseResultViewer({ result }: GreyNoiseResultViewerProps) {
    if (result.error) {
        return <p className="text-muted-foreground text-center py-4">{result.error}</p>;
    }
    
    if (result.noise === false && result.message) {
         return (
             <Card className="mt-4 bg-green-500/10 border-green-500/20">
                <CardHeader className="flex-row items-center gap-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                        <CardTitle className="text-green-700">Not Found in GreyNoise</CardTitle>
                        <CardDescription className="text-green-700/80">{result.message}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        );
    }

  const classificationInfo = useMemo(() => {
    switch (result.classification) {
      case 'benign':
        return { icon: <CheckCircle className="text-green-500" />, text: 'Benign', color: 'text-green-500' };
      case 'malicious':
        return { icon: <AlertCircle className="text-destructive" />, text: 'Malicious', color: 'text-destructive' };
      default:
        return { icon: <HelpCircle className="text-yellow-500" />, text: 'Unknown', color: 'text-yellow-500' };
    }
  }, [result.classification]);
  
  const hasMetadata = !!result.metadata;

  return (
    <div className="space-y-4 pt-4">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>GreyNoise Intelligence</CardTitle>
                        <CardDescription>Analysis for IP: <span className="font-mono">{result.ip}</span></CardDescription>
                    </div>
                    <Badge variant={result.noise ? 'destructive' : 'secondary'}>{result.noise ? "Noise Detected" : "No Noise"}</Badge>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    {classificationInfo.icon}
                    <div>
                        <p className="text-xs text-muted-foreground">Classification</p>
                        <p className={`font-semibold ${classificationInfo.color}`}>{classificationInfo.text}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Calendar className="text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">First Seen</p>
                        <p className="font-semibold">{format(new Date(result.first_seen), 'PP')}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Calendar className="text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Last Seen</p>
                        <p className="font-semibold">{format(new Date(result.last_seen), 'PP')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hasMetadata && <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Globe /> Location & Network</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <div className="flex justify-between"><span>Country</span> <span className="font-medium">{result.metadata.country} ({result.metadata.country_code})</span></div>
                    <div className="flex justify-between"><span>City</span> <span className="font-medium">{result.metadata.city}</span></div>
                    <div className="flex justify-between"><span>ASN</span> <span className="font-medium font-code">{result.metadata.asn}</span></div>
                     <div className="flex justify-between items-center"><span>rDNS</span> <span className="font-medium font-code max-w-[150px] truncate">{result.metadata.rdns}</span></div>
                </CardContent>
            </Card>}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Building /> Organization</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <div className="flex justify-between"><span>Actor</span> <span className="font-medium">{result.actor || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Organization</span> <span className="font-medium">{result.organization || result.metadata?.organization || 'N/A'}</span></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><ToggleLeft /> Flags</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                    <div className="flex justify-between"><span>In GreyNoise</span> <Badge variant={result.noise ? 'default' : 'secondary'}>{result.noise ? 'Yes' : 'No'}</Badge></div>
                    <div className="flex justify-between"><span>Is RIOT</span> <Badge variant={result.riot ? 'default' : 'secondary'}>{result.riot ? 'Yes' : 'No'}</Badge></div>
                    <div className="flex justify-between"><span>Is VPN</span> <Badge variant={result.vpn ? 'default' : 'secondary'}>{result.vpn ? 'Yes' : 'No'}</Badge></div>
                </CardContent>
            </Card>
        </div>
        
        {result.tags?.length > 0 && <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Tag /> Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {result.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </CardContent>
        </Card>}

    </div>
  );
}
