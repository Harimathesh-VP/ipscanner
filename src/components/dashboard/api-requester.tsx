'use client';

import { useState } from 'react';
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
  const { apiKeys } = useApiKeys();

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
    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <Card key={service.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
               <service.icon className="h-6 w-6 text-muted-foreground" />
               <div>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription className="text-xs pt-1">{service.description}</CardDescription>
               </div>
            </div>
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
                <Card className="bg-muted/50 mt-4">
                   <CardHeader className="flex-row items-center justify-between py-3 px-4 border-b">
                     <CardTitle className="text-base font-medium">Raw JSON</CardTitle>
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyJson(results[service.id])}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy JSON</span>
                     </Button>
                   </CardHeader>
                  <CardContent className="p-0">
                    <pre className="text-sm font-code overflow-x-auto p-4">
                      {JSON.stringify(results[service.id], null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
