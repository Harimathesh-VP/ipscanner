'use client';

import React, { useState, Suspense } from 'react';
import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiKeys } from '@/context/api-keys-context';
import { callVirusTotal } from '@/ai/flows/virustotal-flow';
import { callAbuseIPDB } from '@/ai/flows/abuseipdb-flow';
import { callSecurityTrails } from '@/ai/flows/securitytrails-flow';
import { callGreyNoise } from '@/ai/flows/greynoise-flow';
import { callShodan } from '@/ai/flows/shodan-flow';
import { callAlienVault } from '@/ai/flows/alienvault-flow';
import { callIPQualityScore } from '@/ai/flows/ipqualityscore-flow';
import { callCiscoTalos } from '@/ai/flows/ciscotalos-flow';
import { callIBMForce } from '@/ai/flows/ibm-xforce-flow';
import { callGoogleSafeBrowsing } from '@/ai/flows/googlesafebrowsing-flow';
import { callAPIVoid } from '@/ai/flows/apivoid-flow';
import { callWhoisXML } from '@/ai/flows/whoisxml-flow';
import { callSpamhaus } from '@/ai/flows/spamhaus-flow';
import { callNeutrinoAPI } from '@/ai/flows/neutrinoapi-flow';
import { callThreatMiner } from '@/ai/flows/threatminer-flow';
import { callFraudGuard } from '@/ai/flows/fraudguard-flow';
import { callZscaler } from '@/ai/flows/zscaler-flow';
import { callWebroot } from '@/ai/flows/webroot-flow';
import { callRiskIQ } from '@/ai/flows/riskiq-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '../ui/textarea';

const VirusTotalResultViewer = React.lazy(() => import('./virustotal-result-viewer').then(module => ({ default: module.VirusTotalResultViewer })));
const AbuseIPDBResultViewer = React.lazy(() => import('./abuseipdb-result-viewer').then(module => ({ default: module.AbuseIPDBResultViewer })));
const GreyNoiseResultViewer = React.lazy(() => import('./greynoise-result-viewer').then(module => ({ default: module.GreyNoiseResultViewer })));
const AlienVaultResultViewer = React.lazy(() => import('./alienvault-result-viewer').then(module => ({ default: module.AlienVaultResultViewer })));
const IPQualityScoreResultViewer = React.lazy(() => import('./ipqualityscore-result-viewer').then(module => ({ default: module.IPQualityScoreResultViewer })));


const serviceFlows: Record<string, (input: any) => Promise<any>> = {
  virustotal: callVirusTotal,
  abuseipdb: callAbuseIPDB,
  securitytrails: callSecurityTrails,
  greynoise: callGreyNoise,
  shodan: callShodan,
  alienvault: callAlienVault,
  ipqualityscore: callIPQualityScore,
  ciscotalos: callCiscoTalos,
  xforce: callIBMForce,
  googlesafebrowsing: callGoogleSafeBrowsing,
  apivoid: callAPIVoid,
  whoisxml: callWhoisXML,
  spamhaus: callSpamhaus,
  neutrino: callNeutrinoAPI,
  threatminer: callThreatMiner,
  fraudguard: callFraudGuard,
  zscaler: callZscaler,
  webroot: callWebroot,
  riskiq: callRiskIQ,
};

const resultViewers: Record<string, React.ComponentType<{ result: any }>> = {
    virustotal: VirusTotalResultViewer,
    abuseipdb: AbuseIPDBResultViewer,
    greynoise: GreyNoiseResultViewer,
    alienvault: AlienVaultResultViewer,
    ipqualityscore: IPQualityScoreResultViewer,
};

export function ApiRequester() {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { apiKeys, incrementLookupCount, addToHistory } = useApiKeys();

  const handleInputChange = (serviceId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [serviceId]: value }));
  };

  const handleCopyJson = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast({
      title: 'Copied to Clipboard',
      description: 'The JSON response has been copied.',
    });
  };

  const handleSubmit = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const inputValue = inputValues[serviceId];
    if (!inputValue) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter a value to search.',
      });
      return;
    }

    const flow = serviceFlows[serviceId];
    if (!flow) {
      toast({
        variant: 'destructive',
        title: 'Service Not Implemented',
        description: `The service "${serviceId}" is not connected to a live API yet.`,
      });
      return;
    }
    
    const apiKey = apiKeys[serviceId];
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: `Please configure the API key for ${service.name} in settings.`,
      });
      return;
    }


    setLoading((prev) => ({ ...prev, [serviceId]: true }));
    setResults((prev) => ({ ...prev, [serviceId]: null }));
    

    let result;
    try {
      let serviceInput;
      const inputPayload = { apiKeys };

      if (service.inputType === 'ipAddress') {
        serviceInput = { ...inputPayload, ipAddress: inputValue };
      } else if (service.inputType === 'query') {
        serviceInput = { ...inputPayload, query: inputValue };
      } else {
        serviceInput = { ...inputPayload, resource: inputValue };
      }

      result = await flow(serviceInput);
      setResults((prev) => ({
        ...prev,
        [serviceId]: result,
      }));
      incrementLookupCount();
      addToHistory({ service: service.name, target: inputValue, status: 'Success', response: result });
    } catch (error: any) {
      console.error(`Error fetching from ${serviceId}:`, error);
      const errorResult = { error: error.message };
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: error.message || `Could not fetch data from ${service.name}.`,
      });
      setResults((prev) => ({
        ...prev,
        [serviceId]: errorResult,
      }));
      incrementLookupCount();
      addToHistory({ service: service.name, target: inputValue, status: 'Failed', response: errorResult });
    } finally {
      setLoading((prev) => ({ ...prev, [serviceId]: false }));
    }
  };
  
  const loadingSkeleton = (
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  )

  return (
    <Tabs defaultValue={services[0].id} className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
        {services.map((service) => (
          <TabsTrigger key={service.id} value={service.id} className="flex-col h-14 gap-1">
             <service.icon className="h-6 w-6" />
             <span className="text-xs">{service.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {services.map((service) => (
        <TabsContent key={service.id} value={service.id}>
           <Card className="mt-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <service.icon className="h-6 w-6 text-muted-foreground" />
                        {service.name}
                    </CardTitle>
                    {results[service.id] && (
                         <Button variant="outline" size="sm" onClick={() => handleCopyJson(results[service.id])}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy JSON
                        </Button>
                    )}
                </div>
                <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                <form
                    className="flex w-full items-center space-x-2"
                    onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(service.id);
                    }}
                >
                    <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={service.placeholder}
                        className="pl-10"
                        value={inputValues[service.id] || ''}
                        onChange={(e) => handleInputChange(service.id, e.target.value)}
                    />
                    </div>
                    <Button type="submit" disabled={loading[service.id]}>
                    {loading[service.id] ? 'Fetching...' : 'Fetch'}
                    </Button>
                </form>
                {loading[service.id] && loadingSkeleton}
                {results[service.id] && (
                    <Suspense fallback={loadingSkeleton}>
                      {(() => {
                          const Viewer = resultViewers[service.id];
                          if (Viewer) {
                              return <Viewer result={results[service.id]} />;
                          }
                          return (
                             <Textarea
                                readOnly
                                value={JSON.stringify(results[service.id], null, 2)}
                                className="h-64 font-code text-xs bg-muted/50 mt-4"
                              />
                          );
                      })()}
                    </Suspense>
                )}
                </div>
            </CardContent>
            </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
