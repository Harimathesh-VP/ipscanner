import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">API Key Configuration</h1>
        <p className="text-muted-foreground">Manage your API keys for third-party services.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <service.icon className="h-6 w-6 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">{service.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Enter your API key" type="password" className="pl-10" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Save Key</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
