'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  AlertTriangle,
  ShieldCheck,
  Building,
  Calendar,
  Wifi,
  Users,
} from 'lucide-react';

type IPQSResult = {
  message?: string;
  success?: boolean;
  fraud_score: number;
  country_code: string;
  region: string;
  city: string;
  ISP: string;
  ASN: number;
  organization: string;
  is_crawler: boolean;
  timezone: string;
  mobile: boolean;
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
  recent_abuse: boolean;
  bot_status: boolean;
  connection_type: string;
  abuse_velocity: string;
  error?: string;
};

interface IPQualityScoreResultViewerProps {
  result: IPQSResult;
}

export function IPQualityScoreResultViewer({ result }: IPQualityScoreResultViewerProps) {
  if (!result.success && result.message) {
    return <p className="text-muted-foreground text-center py-4">{result.message}</p>;
  }
  if (result.error) {
      return <p className="text-muted-foreground text-center py-4">{result.error}</p>;
  }

  const scoreColor = useMemo(() => {
    if (result.fraud_score > 85) return 'bg-destructive';
    if (result.fraud_score > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }, [result.fraud_score]);
  
  const riskFlags = [
      {label: 'Proxy', value: result.proxy},
      {label: 'VPN', value: result.vpn},
      {label: 'Tor', value: result.tor},
      {label: 'Bot', value: result.bot_status},
      {label: 'Recent Abuse', value: result.recent_abuse},
      {label: 'Crawler', value: result.is_crawler},
  ].filter(flag => flag.value);

  return (
    <div className="pt-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Fraud Score</CardTitle>
          <CardDescription>
            Confidence score for fraudulent activity, from 0 to 100. Higher is riskier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">{result.fraud_score}</span>
            <Progress value={result.fraud_score} indicatorClassName={scoreColor} className="flex-1" />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
              <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Globe /> Location & Time</CardTitle>
              </CardHeader>
               <CardContent className="grid gap-3 text-sm">
                  <div className="flex justify-between"><span>Location</span> <span className="font-medium">{result.city}, {result.region}, {result.country_code}</span></div>
                  <div className="flex justify-between"><span>Timezone</span> <span className="font-medium">{result.timezone}</span></div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Building /> Network & ISP</CardTitle>
              </CardHeader>
               <CardContent className="grid gap-3 text-sm">
                  <div className="flex justify-between"><span>ISP</span> <span className="font-medium">{result.ISP}</span></div>
                  <div className="flex justify-between"><span>Organization</span> <span className="font-medium">{result.organization}</span></div>
                  <div className="flex justify-between"><span>ASN</span> <span className="font-medium font-code">AS{result.ASN}</span></div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><Wifi /> Connection Details</CardTitle>
              </CardHeader>
               <CardContent className="grid gap-3 text-sm">
                  <div className="flex justify-between"><span>Type</span> <span className="font-medium">{result.connection_type}</span></div>
                  <div className="flex justify-between"><span>Mobile</span> <Badge variant={result.mobile ? 'default' : 'secondary'}>{result.mobile ? "Yes" : "No"}</Badge></div>
                  <div className="flex justify-between"><span>Abuse Velocity</span> <span className="font-medium">{result.abuse_velocity}</span></div>
              </CardContent>
          </Card>
      </div>

       {riskFlags.length > 0 && <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-muted-foreground"><AlertTriangle /> Risk Factors</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {riskFlags.map(flag => <Badge key={flag.label} variant="destructive">{flag.label}</Badge>)}
            </CardContent>
        </Card>}

    </div>
  );
}
