'use client';

import type { RequestLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HistoryDetailViewerProps {
  log: RequestLog;
}

export function HistoryDetailViewer({ log }: HistoryDetailViewerProps) {
  const { toast } = useToast();

  const handleCopyJson = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast({
      title: 'Copied to Clipboard',
      description: 'The JSON response has been copied.',
    });
  };
    
  return (
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
            <p className="text-muted-foreground">Service</p>
            <p className="font-semibold">{log.service}</p>
        </div>
         <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-semibold font-code">{log.target}</p>
        </div>
         <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-semibold">{format(new Date(log.date), 'PPpp')}</p>
        </div>
         <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-semibold">
                <Badge variant={log.status === 'Success' ? 'default' : 'destructive'} 
                       className={log.status === 'Success' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : ''}>
                  {log.status}
                </Badge>
            </p>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
               <CardTitle className="text-base">Raw JSON Response</CardTitle>
               <CardDescription className="text-xs">The full response from the API.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleCopyJson(log.response)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
            </Button>
        </CardHeader>
        <CardContent>
            <Textarea
              readOnly
              value={JSON.stringify(log.response, null, 2)}
              className="h-80 font-code text-xs bg-muted/50"
            />
        </CardContent>
      </Card>
    </div>
  );
}
