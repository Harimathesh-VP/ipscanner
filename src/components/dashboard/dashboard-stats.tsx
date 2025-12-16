'use client';

import { KeyRound, Search, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiKeys } from '@/context/api-keys-context';
import { mockRequestLogs } from '@/lib/mock-data';

export function DashboardStats() {
  const { apiKeys, lookupCount } = useApiKeys();

  const configuredKeysCount = Object.keys(apiKeys).length;
  const historyCount = mockRequestLogs.length;

  const stats = [
    {
      title: 'Configured Keys',
      value: configuredKeysCount,
      icon: KeyRound,
      description: 'API keys saved in settings',
    },
    {
      title: 'Total Lookups',
      value: lookupCount,
      icon: Search,
      description: 'Requests made this session',
    },
    {
      title: 'Search History',
      value: historyCount,
      icon: History,
      description: 'Total logged requests',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
