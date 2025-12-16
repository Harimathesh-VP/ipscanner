'use client';

import { useState } from 'react';
import type { RequestLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, Search, Upload, Trash2, ChevronDown } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';


export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const { toast } = useToast();

  const filteredLogs = logs.filter(log =>
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.service.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "api_sentinel_history.json";
    link.click();
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const headers = Object.keys(filteredLogs[0]).join(',');
    const rows = filteredLogs.map(log => {
      // Handle nested response object by stringifying it
      const responseString = JSON.stringify(log.response).replace(/,/g, ';');
      const values = [log.id, log.service, log.target, log.date, log.status, `"${responseString}"`];
      return values.join(',');
    });
    const csvString = `data:text/csv;charset=utf-8,${encodeURIComponent([headers, ...rows].join('\n'))}`;
    const link = document.createElement("a");
    link.href = csvString;
    link.download = "api_sentinel_history.csv";
    link.click();
  };
  
  const handleImportClick = () => {
    document.getElementById('import-input')?.click();
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedLogs: RequestLog[] = [];

        if (file.name.endsWith('.json')) {
          importedLogs = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            importedLogs = lines.slice(1).map((line, index) => {
                const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle commas inside quoted strings
                const log: any = {};
                headers.forEach((header, i) => {
                    const key = header.trim();
                    let value = values[i] || '';
                    if (key === 'response') {
                        value = JSON.parse(value.replace(/^"|"$/g, '').replace(/;/g, ','));
                    }
                    log[key] = value;
                });
                return log as RequestLog;
            }).filter(l => l.id); // Filter out empty lines
        } else if (file.name.endsWith('.txt')) {
           try {
             // Try parsing as JSON first
             importedLogs = JSON.parse(content);
           } catch(err) {
             // If not JSON, maybe it's CSV-like content in a txt file
              const lines = content.split('\n');
              const headers = lines[0].split(',');
              if (headers.length < 2) throw new Error("Invalid TXT content, expected JSON or CSV format.");
              
              importedLogs = lines.slice(1).map((line) => {
                  const values = line.split(',');
                  const log: any = {};
                  headers.forEach((header, i) => log[header.trim()] = values[i]);
                  if(log.response) log.response = JSON.parse(log.response);
                  return log as RequestLog;
              }).filter(l => l.id);
           }
        } else {
            throw new Error("Unsupported file format. Please use JSON, CSV, or TXT.");
        }

        // Basic validation
        if (!Array.isArray(importedLogs) || importedLogs.some(log => !log.id || !log.service || !log.date)) {
            throw new Error("Invalid log format in the imported file.");
        }

        setLogs(prevLogs => [...prevLogs, ...importedLogs]);
        toast({
          title: "Import Successful",
          description: `${importedLogs.length} logs have been imported.`,
        });

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error.message || "Could not parse the file. Please check its format.",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };
  
  const handleClearHistory = () => {
    setLogs([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Request History</h1>
        <p className="text-muted-foreground">
          Browse, search, import, and export your past API requests.
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
               <input type="file" id="import-input" className="hidden" accept=".json,.csv,.txt" onChange={handleFileImport} />
               <Button variant="outline" onClick={handleImportClick}><Upload className="mr-2 h-4 w-4" /> Import</Button>
               
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" /> Export <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleExportJson}>As JSON</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCsv}>As CSV</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
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
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No logs found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
