'use client';

import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, CheckCircle, ExternalLink, Info, Eye, EyeOff, Copy, Pencil, Trash2, Power, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiKeys } from '@/context/api-keys-context';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { serviceFlows } from '@/lib/service-flows';

export default function SettingsPage() {
  const { toast } = useToast();
  const { apiKeys, setApiKey, removeApiKey } = useApiKeys();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const toggleShowKey = (serviceId: string) => {
    setShowKey(prev => ({...prev, [serviceId]: !prev[serviceId]}));
  }

  const validateKey = (key: string): boolean => {
    return key.length >= 10;
  }

  const maskApiKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) {
      return '****...****';
    }
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied to Clipboard',
      description: 'The API key has been copied.',
    });
  }

  const handleTestKey = async (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    const key = apiKeys[serviceId];
    const flow = serviceFlows[serviceId];

    if (!service || !key || !flow) {
      toast({ variant: 'destructive', title: 'Test Failed', description: 'Service configuration is missing.' });
      return;
    }
    
    setTesting(prev => ({...prev, [serviceId]: true}));
    toast({
      title: `Testing ${service.name}...`,
      description: 'Sending a lightweight test request.',
    });
    
    try {
      // Use a common, low-cost query for testing
      let testInput: any;
      const testResource = service.inputType === 'ipAddress' ? '8.8.8.8' : service.id === 'shodan' ? 'port:443' : 'google.com';

      if (service.inputType === 'ipAddress') {
        testInput = { ipAddress: testResource, apiKeys: { [serviceId]: key }};
      } else if (service.inputType === 'query') {
        testInput = { query: testResource, apiKeys: { [serviceId]: key }};
      } else {
        testInput = { resource: testResource, apiKeys: { [serviceId]: key }};
      }
      
      const result = await flow(testInput);

      if (result.error || result.success === false) {
         throw new Error(result.error || result.message || 'The API key is invalid or the request failed.');
      }
      
      toast({
        title: 'Test Successful',
        description: `The API key for ${service.name} is valid.`,
        className: 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700',
      });

    } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Test Failed',
          description: error.message || `The API key for ${service.name} appears to be invalid.`,
        });
    } finally {
        setTesting(prev => ({...prev, [serviceId]: false}));
    }
  }

  const handleTestAllKeys = async () => {
    const configuredServices = services.filter((service) => apiKeys[service.id]);
    toast({
      title: 'Testing All Keys',
      description: `Starting validation for ${configuredServices.length} configured keys.`,
    });
    
    for (const service of configuredServices) {
       await handleTestKey(service.id);
    }

    toast({
      title: 'All Tests Complete',
      description: 'Finished validating all configured API keys.',
    });
  }


  const handleSaveKey = (serviceId: string, e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('apiKey') as HTMLInputElement;
    const key = input.value.trim();
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    if (!key) {
      if (apiKeys[serviceId]) {
        removeApiKey(serviceId);
        toast({
          title: 'API Key Removed',
          description: `Your API key for ${service.name} has been removed.`,
        });
      }
      return;
    }

    if (validateKey(key)) {
      setApiKey(serviceId, key);
      toast({
        title: 'API Key Saved',
        description: `Your API key for ${service.name} has been configured.`,
      });
      setErrors(prev => ({...prev, [serviceId]: null}));
    } else {
      const errorMessage = 'Please enter a valid API key (at least 10 characters).';
      setErrors(prev => ({...prev, [serviceId]: errorMessage}));
      toast({
        variant: 'destructive',
        title: 'Invalid API Key',
        description: errorMessage,
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
              <Card key={service.id} className={errors[service.id] ? 'border-destructive' : ''}>
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
                        <Input 
                            name="apiKey" 
                            placeholder="Enter your API key" 
                            type="password"
                            className="pl-10"
                        />
                      </div>
                      {errors[service.id] && <p className="text-xs text-destructive mt-2">{errors[service.id]}</p>}
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight font-headline">Configured Services</h2>
              <Button variant="outline" onClick={handleTestAllKeys} disabled={Object.values(testing).some(t => t)}>
                  <Zap className="mr-2 h-4 w-4" /> Test All Keys
              </Button>
            </div>
             <div className="grid gap-6 md:grid-cols-2">
              {configuredServices.map((service) => (
                <Card key={service.id} className={`border-primary/20 bg-primary/5 ${errors[service.id] ? 'border-destructive' : ''}`}>
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
                          id={`api-key-input-${service.id}`}
                          name="apiKey"
                          defaultValue={maskApiKey(apiKeys[service.id] || '')}
                          onFocus={(e) => {
                            e.target.value = apiKeys[service.id] || ''
                          }}
                          onBlur={(e) => {
                              e.target.value = maskApiKey(apiKeys[service.id] || '')
                          }}
                          placeholder="Enter new key to update"
                          type={showKey[service.id] ? 'text' : 'password'}
                          className="pl-10"
                        />
                      </div>
                      {errors[service.id] && <p className="text-xs text-destructive mt-2">{errors[service.id]}</p>}
                  </CardContent>
                  <CardFooter className="flex justify-between bg-primary/10 px-6 py-4 border-t border-primary/20">
                     <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => toggleShowKey(service.id)}>
                            {showKey[service.id] ? <EyeOff /> : <Eye />}
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleCopyKey(apiKeys[service.id])}>
                            <Copy />
                        </Button>
                         <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => document.getElementById(`api-key-input-${service.id}`)?.focus()}>
                            <Pencil />
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive">
                                <Trash2 />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the API key for {service.name}. You will need to re-enter it to use the service again.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleSaveKey(service.id, { preventDefault: () => {}, target: { elements: { namedItem: () => ({ value: '' })}}} as any)}>
                                Yes, Delete Key
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                     </div>
                     <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleTestKey(service.id)} disabled={testing[service.id]}>
                          {testing[service.id] ? "Testing..." : <><Power className="mr-2 h-4 w-4" />Test</>}
                        </Button>
                        <Button type="submit" variant="outline" size="sm">Update Key</Button>
                     </div>
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
