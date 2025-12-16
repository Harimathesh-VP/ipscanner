'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BarChart, XAxis, YAxis, Bar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { services } from '@/lib/services';
import { generateReport } from '@/ai/flows/report-flow';
import type { ReportOutput } from '@/ai/flows/report-flow';
import ReactMarkdown from 'react-markdown';
import { useApiKeys } from '@/context/api-keys-context';


const formSchema = z.object({
  indicator: z.string().min(1, 'Indicator is required.'),
  selectedServices: z.array(z.string()).min(1, 'Please select at least one service.'),
});

export function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportOutput | null>(null);
  const { toast } = useToast();
  const { apiKeys } = useApiKeys();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      indicator: '',
      selectedServices: services.map(s => s.id),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setResult(null);
    try {
      const report = await generateReport({ 
        indicator: values.indicator, 
        selectedServices: values.selectedServices,
        apiKeys: apiKeys 
      });
      setResult(report);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Report',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const chartConfig = {
      malicious: { label: "Malicious", color: "hsl(var(--destructive))" },
      suspicious: { label: "Suspicious", color: "hsl(var(--accent))" },
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Configure the indicator and services for your report.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="indicator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicator</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 8.8.8.8 or google.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                    control={form.control}
                    name="selectedServices"
                    render={() => (
                        <FormItem>
                         <div className="mb-4">
                            <FormLabel className="text-base">Services</FormLabel>
                            <p className="text-sm text-muted-foreground">Select the data sources to include.</p>
                         </div>
                         <div className="space-y-3">
                            {services.map((service) => (
                                <FormField
                                key={service.id}
                                control={form.control}
                                name="selectedServices"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={service.id}
                                        className="flex flex-row items-center space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(service.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, service.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== service.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal flex items-center gap-2">
                                            <service.icon className="h-4 w-4" /> {service.name}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                         </div>
                         <FormMessage />
                        </FormItem>
                    )}
                />


                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generated Report</CardTitle>
            <CardDescription>This is a data summary based on the selected services.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <br />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            )}
            {!loading && !result && (
              <div className="text-center text-muted-foreground py-12">
                Your generated report will appear here.
              </div>
            )}
            {result && (
                <div className="space-y-6">
                     <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{result.summary}</ReactMarkdown>
                    </div>

                    {result.chartData && result.chartData.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Analysis Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                    <BarChart accessibilityLayer data={result.chartData}>
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="malicious" fill="var(--color-malicious)" radius={4} />
                                        <Bar dataKey="suspicious" fill="var(--color-suspicious)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    )}
                    
                    <Card>
                        <CardHeader>
                           <CardTitle>Raw Data</CardTitle>
                           <CardDescription>Complete JSON output from all services.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                readOnly
                                value={JSON.stringify(result.rawData, null, 2)}
                                className="h-96 font-code text-xs"
                            />
                        </CardContent>
                    </Card>

                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
