'use client';

import { useState } from 'react';
import { mockRequestLogs as generateMockLogs } from '@/lib/mock-data';
import type { RequestLog } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, Search, Upload, Trash2 } from 'lucide-react';
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

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<RequestLog[]>(() => generateMockLogs());

  const filteredLogs = logs.filter(log =>
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.service.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "api_sentinel_history.json";
    link.click();
  };
  
  const handleImportClick = () => {
    // This is a mock action. In a real app, you'd handle file selection.
    document.getElementById('import-input')?.click();
  }
  
  const handleClearHistory = () => {
    setLogs([]);
    // In a real application, you would also clear this from persistent storage.
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Request History</h1>
        <p className="text-muted-foreground">
          Browse and search your past API requests.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Requests</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
               <input type="file" id="import-input" className="hidden" accept=".json,.csv,.txt" />
               <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4" /> Import</Button>
               <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={logs.length === 0}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear History
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all request logs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory}>
                        Yes, delete history
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.service}</TableCell>
                  <TableCell className="font-code">{log.target}</TableCell>
                  <TableCell>{format(new Date(log.date), 'PPpp')}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'Success' ? 'default' : 'destructive'} 
                           className={log.status === 'Success' ? 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30' : ''}>
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           {filteredLogs.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              No logs found.
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
