'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { services } from '@/lib/services';
import { ArrowRight, Check } from 'lucide-react';
import { ApiSentinelLogo } from '@/components/logos/api-sentinel-logo';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
          <Link href="#" className="flex items-center gap-2 font-semibold" prefetch={false}>
            <ApiSentinelLogo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold font-headline">API Sentinel</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl xl:text-6xl/none">
                    Unified Threat Intelligence
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    API Sentinel is your central hub for querying top-tier security APIs. Aggregate data, generate reports, and streamline your threat analysis workflow.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="group">
                    <Link href="/login">
                      Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
               <div className="flex items-center justify-center">
                    <ApiSentinelLogo className="h-48 w-48 lg:h-64 lg:w-64 text-primary" />
                </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-5xl">Everything You Need for Threat Intel</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From single queries to consolidated reports, get the data you need, how you need it.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-3 mt-12">
              <div className="grid gap-1">
                <h3 className="text-lg font-bold flex items-center gap-2"><Check className="text-primary"/>Multi-Service Queries</h3>
                <p className="text-sm text-muted-foreground">
                  Query multiple threat intelligence platforms from a single, unified interface.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold flex items-center gap-2"><Check className="text-primary"/>Centralized API Key Management</h3>
                <p className="text-sm text-muted-foreground">
                  Securely store and manage your API keys for all supported services in one place.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold flex items-center gap-2"><Check className="text-primary"/>Consolidated Reporting</h3>
                <p className="text-sm text-muted-foreground">
                   Generate comprehensive reports that aggregate data from multiple sources for any given indicator.
                </p>
              </div>
               <div className="grid gap-1">
                <h3 className="text-lg font-bold flex items-center gap-2"><Check className="text-primary"/>Rich Data Visualization</h3>
                <p className="text-sm text-muted-foreground">
                   Understand VirusTotal results instantly with categorized and color-coded vendor analysis.
                </p>
              </div>
              <div className="grid gap-1">
                <h3 className="text-lg font-bold flex items-center gap-2"><Check className="text-primary"/>Request History</h3>
                <p className="text-sm text-muted-foreground">
                  Keep track of all your queries. Import and export your history in JSON or CSV format.
                </p>
              </div>
               <div className="grid gap-1">
                <h3 className="text-lg font-bold flex items-center gap-2"><Check className="text-primary"/>Developer-Focused</h3>
                <p className="text-sm text-muted-foreground">
                   Easily view and copy the raw JSON responses from any API for use in your own tools and scripts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="integrations" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                 <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Integrations</div>
                <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-5xl">Supported API Providers</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connect to industry-leading threat intelligence services. More integrations coming soon.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6 lg:gap-6">
              {services.map((service) => (
                <Card key={service.id} className="h-full">
                  <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 h-full">
                    <service.icon className="h-12 w-12" />
                    <span className="mt-3 text-sm font-medium text-center">{service.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="flex justify-center text-xs text-muted-foreground mt-6">
                All product names, logos, and brands are property of their respective owners.
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} API Sentinel. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
