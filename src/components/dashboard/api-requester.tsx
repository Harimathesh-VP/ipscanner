'use client';

import { useState } from 'react';
import { services } from '@/lib/services';
import { mockApiResponses } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export function ApiRequester() {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  const handleInputChange = (serviceId: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [serviceId]: value }));
  };

  const handleSubmit = (serviceId: string) => {
    setLoading((prev) => ({ ...prev, [serviceId]: true }));
    setResults((prev) => ({ ...prev, [serviceId]: null }));

    setTimeout(() => {
      setResults((prev) => ({
        ...prev,
        [serviceId]: mockApiResponses[serviceId] || { error: 'No mock data available' },
      }));
      setLoading((prev) => ({ ...prev, [serviceId]: false }));
    }, 1500);
  };

  return (
    <Tabs defaultValue={services[0].id} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        {services.map((service) => (
          <TabsTrigger key={service.id} value={service.id}>
            <service.icon className="mr-2 h-4 w-4" />
            {service.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {services.map((service) => (
        <TabsContent key={service.id} value={service.id}>
          <Card>
            <CardHeader>
              <CardTitle>{service.description}</CardTitle>
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
        </TabsContent>
      ))}
    </Tabs>
  );
}
