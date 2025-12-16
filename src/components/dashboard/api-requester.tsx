'use client';

import { useState } from 'react';
import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Search, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiKeys } from '@/context/api-keys-context';
import { callVirusTotal } from '@/ai/flows/virustotal-flow';
import { callAbuseIPDB } from '@/ai/flows/abuseipdb-flow';
import { callSecurityTrails } from '@/ai/flows/securitytrails-flow';
import { callGreyNoise } from '@/ai/flows/greynoise-flow';
import { callShodan } from '@/ai/flows/shodan-flow';
import { callAlienVault } from '@/ai/flows/alienvault-flow';
import { VirusTotalResultViewer } from './virustotal-result-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const serviceFlows: Record<string, (input: any) => Promise<any>> = {
  virustotal: callVirusTotal,
  abuseipdb: callAbuseIPDB,
  securitytrails: callSecurityTrails,
  greynoise: callGreyNoise,
  shodan: callShodan,
  alienvault: callAlienVault,
};

export function ApiRequester() {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const { apiKeys, incrementLookupCount } = useApiKeys();

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
        description: `Please configure the API key for ${services.find(s => s.id === serviceId)?.name} in settings.`,
      });
      return;
    }


    setLoading((prev) => ({ ...prev, [serviceId]: true }));
    setResults((prev) => ({ ...prev, [serviceId]: null }));
    incrementLookupCount();

    try {
      const service = services.find(s => s.id === serviceId);
      let serviceInput;
      if (service?.inputType === 'ipAddress') {
        serviceInput = { ipAddress: inputValue, apiKey };
      } else if (service?.inputType === 'query') {
        serviceInput = { query: inputValue, apiKey };
      } else {
        serviceInput = { resource: inputValue, apiKey };
      }

      const result = await flow(serviceInput);
      setResults((prev) => ({
        ...prev,
        [serviceId]: result,
      }));
    } catch (error: any) {
      console.error(`Error fetching from ${serviceId}:`, error);
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: error.message || `Could not fetch data from ${services.find(s => s.id === serviceId)?.name}.`,
      });
      setResults((prev) => ({
        ...prev,
        [serviceId]: { error: error.message },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  return (
    <Tabs defaultValue={services[0].id} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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
                    {results[service.id] && service.id !== 'virustotal' && (
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
                {loading[service.id] && (
                    <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                    </div>
                )}
                {results[service.id] && (
                    <>
                    {service.id === 'virustotal' && results[service.id]?.data?.attributes?.last_analysis_results ? (
                        <VirusTotalResultViewer result={results[service.id]} />
                    ) : (
                       <Card className="bg-muted/50 mt-4">
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <p>Response received.</p>
                            <p className="text-xs">Click the "Copy JSON" button above to view the raw data.</p>
                        </CardContent>
                       </Card>
                    )}
                    </>
                )}
                </div>
            </CardContent>
            </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
