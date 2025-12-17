'use client';

import { services } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ProviderInfoPage() {

    const getPricingBadge = (pricing: 'Freemium' | 'Paid' | 'Free') => {
        switch (pricing) {
            case 'Freemium':
                return <Badge variant="secondary" className="border-blue-500/30 bg-blue-500/10 text-blue-700">Freemium</Badge>
            case 'Paid':
                return <Badge variant="secondary" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-700">Paid</Badge>
            case 'Free':
                return <Badge variant="secondary" className="border-green-500/30 bg-green-500/10 text-green-700">Free</Badge>
        }
    }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">API Provider Information</h1>
        <p className="text-muted-foreground">
          Details on pricing, rate limits, and documentation for each integrated service.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col">
            <CardHeader className="flex-row items-start gap-4">
              <service.icon className="h-10 w-10 text-muted-foreground mt-1" />
              <div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription className="mt-1">{service.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-sm">Pricing Model</span>
                    </div>
                    {getPricingBadge(service.pricing)}
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-sm">Daily Limit (Free Tier)</span>
                    </div>
                    <span className="text-sm font-semibold">
                        {service.requestLimit !== null ? service.requestLimit.toLocaleString() : 'N/A'}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-3 border-t">
                <Button variant="ghost" size="sm" asChild className="w-full justify-center">
                    <Link href={service.documentationUrl} target="_blank" rel="noopener noreferrer">
                         <ExternalLink className="mr-2 h-4 w-4" />
                         View API Documentation
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
