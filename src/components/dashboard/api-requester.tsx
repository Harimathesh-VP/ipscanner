'use client';

import { useState } from 'react';
import { services } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { callVirusTotal } from '@/ai/flows/virustotal-flow';
import { callAbuseIPDB } from '@/ai/flows/abuseipdb-flow';

const serviceFlows: Record<string, (input: any) => Promise<any>> = {
  virustotal: (input: string) => callVirusTotal({ resource: input }),
  abuseipdb: (input: string) => callAbuseIPDB({ ipAddress: input }),
  // Add other service flows here
};


export function ApiRequester() {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleInputChange = (serviceId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [serviceId]: value }));
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
      // Mock response for unimplemented services
      setLoading((prev) => ({ ...prev, [serviceId]: true }));
      setTimeout(() => {
        setResults((prev) => ({
          ...prev,
          [serviceId]: { message: 'This service is not yet implemented for live data.' },
        }));
        setLoading((prev) => ({ ...prev, [serviceId]: false }));
      }, 500);
      return;
    }

    setLoading((prev) => ({ ...prev, [serviceId]: true }));
    setResults((prev) => ({ ...prev, [serviceId]: null }));

    try {
      const result = await flow(inputValue);
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
               <CardTitle>{service.name}</CardTitle>
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
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[220px]" />
                </div>
              )}
              {results[service.id] && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <pre className="text-sm font-code overflow-x-auto p-2 bg-background rounded-md">
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
