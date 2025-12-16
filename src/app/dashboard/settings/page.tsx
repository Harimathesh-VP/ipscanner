'use client';

import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, CheckCircle, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiKeys } from '@/context/api-keys-context';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
      input.value = '';
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">API Key Configuration</h1>
        <p className="text-muted-foreground">Manage your API keys for third-party services.</p>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight font-headline">Unconfigured Services</h2>
        {unconfiguredServices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {unconfiguredServices.map((service) => (
              <Card key={service.id}>
                <form onSubmit={(e) => handleSaveKey(service.id, e)}>
                  <CardHeader className="flex-row gap-4 items-start">
                    <service.icon className="h-10 w-10 text-muted-foreground mt-1" />
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{service.name}</CardTitle>
                            {service.alias && <Badge variant="outline">{service.alias}</Badge>}
                        </div>
                        <CardDescription className="mt-1">{service.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input name="apiKey" placeholder="Enter your API key" type="password" className="pl-10" />
                      </div>
                  </CardContent>
                   <CardFooter className="flex justify-between bg-muted/50 px-6 py-4 border-t">
                      <Button variant="outline" size="sm" asChild>
                         <a href={service.documentationUrl} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="mr-2 h-4 w-4" /> API Docs
                         </a>
                      </Button>
                      <Button type="submit" size="sm">Save Key</Button>
                   </CardFooter>
                </form>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold">All Keys Configured</h3>
                <p className="text-muted-foreground mt-1">You have provided API keys for all available services.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {configuredServices.length > 0 && (
         <>
          <Separator />
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight font-headline">Configured Services</h2>
             <div className="grid gap-6 md:grid-cols-2">
              {configuredServices.map((service) => (
                <Card key={service.id} className="border-primary/20 bg-primary/5">
                 <form onSubmit={(e) => handleSaveKey(service.id, e)}>
                  <CardHeader className="flex-row gap-4 items-start">
                    <service.icon className="h-10 w-10 text-primary mt-1" />
                    <div>
                        <div className="flex items-center gap-2">
                           <CardTitle className="text-xl text-primary">{service.name}</CardTitle>
                           {service.alias && <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">{service.alias}</Badge>}
                        </div>
                        <CardDescription className="mt-1 text-primary/80">API key is configured. You can update it below.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                       <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="apiKey"
                          placeholder="Enter new key to update"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-primary/10 px-6 py-4 border-t border-primary/20">
                     <Button variant="outline" size="sm" asChild>
                         <a href={service.documentationUrl} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="mr-2 h-4 w-4" /> API Docs
                         </a>
                      </Button>
                      <Button type="submit" variant="outline" size="sm">Update Key</Button>
                  </CardFooter>
                 </form>
                </Card>
              ))}
            </div>
          </div>
         </>
      )}

    </div>
  );
}
