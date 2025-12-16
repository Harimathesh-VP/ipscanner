'use client';

import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApiKeys } from '@/context/api-keys-context';

export default function SettingsPage() {
  const { toast } = useToast();
  const { apiKeys, setApiKey } = useApiKeys();

  const handleSaveKey = (serviceId: string, e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('apiKey') as HTMLInputElement;
    const key = input.value;

    if (key) {
      setApiKey(serviceId, key);
      toast({
        title: 'API Key Saved',
        description: `Your API key for ${services.find((s) => s.id === serviceId)?.name} has been configured.`,
      });
      // In a real app, you would encrypt and save this to a secure backend or local storage.
    } else {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please enter an API key.',
      });
    }
  };

  const configuredServices = services.filter((service) => apiKeys[service.id]);
  const unconfiguredServices = services.filter((service) => !apiKeys[service.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">API Key Configuration</h1>
        <p className="text-muted-foreground">Manage your API keys for third-party services.</p>
      </div>

      <Tabs defaultValue="configure">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configure">Configure New Keys</TabsTrigger>
          <TabsTrigger value="configured">Update Configured Keys ({configuredServices.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="configure">
          {unconfiguredServices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
              {unconfiguredServices.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <service.icon className="h-8 w-8 text-muted-foreground" />
                      <CardTitle className="text-lg font-medium">{service.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={(e) => handleSaveKey(service.id, e)}>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input name="apiKey" placeholder="Enter your API key" type="password" className="pl-10" />
                      </div>
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                        Save Key
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold">All Keys Configured</h3>
                  <p className="text-muted-foreground mt-1">You have provided API keys for all available services.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="configured">
          {configuredServices.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-4">
              {configuredServices.map((service) => (
                <Card key={service.id} className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <service.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg font-medium text-primary">{service.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={(e) => handleSaveKey(service.id, e)}>
                       <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="apiKey"
                          placeholder="Enter new key to update"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                      <Button type="submit" variant="outline" className="w-full">
                        Update Key
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
             <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="text-center p-8 text-muted-foreground">
                  <p>No API keys have been configured yet.</p>
                  <p className="text-sm">Go to the "Configure New Keys" tab to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
