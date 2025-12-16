'use client';

import { generateDataVisualization } from '@/ai/flows/generate-data-visualization';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart, XAxis, YAxis, Bar } from 'recharts';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  visualizationType: z.enum(['chart', 'graph', 'table']),
  apiData: z.string().refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Must be valid JSON.' }
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [visualization, setVisualization] = useState<any>(null);
  const [visualizationType, setVisualizationType] = useState<'chart' | 'graph' | 'table' | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: 'IP Address Analysis',
      visualizationType: 'chart',
      apiData: JSON.stringify(
        {
          data: [
            { ip: '8.8.8.8', score: 0 },
            { ip: '1.1.1.1', score: 10 },
            { ip: '104.18.25.86', score: 90 },
            { ip: '192.168.1.1', score: 0 },
          ],
        },
        null,
        2
      ),
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setVisualization(null);
    setVisualizationType(values.visualizationType);

    try {
      const result = await generateDataVisualization(values);
      const parsedViz = JSON.parse(result.visualization);
      setVisualization(parsedViz);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate visualization. Please check your data and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Input your JSON data and select a visualization type.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Report Title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visualizationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visualization Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="chart">Chart</SelectItem>
                          <SelectItem value="graph">Graph</SelectItem>
                          <SelectItem value="table">Table</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Data (JSON)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Paste your JSON data here" className="h-48 font-code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Generate Report
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-3">
        <Card className="min-h-[600px]">
          <CardHeader>
            <CardTitle>Generated Visualization</CardTitle>
            <CardDescription>
              {visualization ? form.getValues('title') : 'Your report will appear here.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-full">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {!isLoading && !visualization && <div className="text-muted-foreground">Waiting for data...</div>}
            {visualization && (visualizationType === 'chart' || visualizationType === 'graph') && (
              <ChartContainer config={visualization.chartConfig} className="min-h-[400px] w-full">
                <BarChart accessibilityLayer data={visualization.chartData}>
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
            {visualization && visualizationType === 'table' && (
              <div
                className="prose dark:prose-invert w-full"
                dangerouslySetInnerHTML={{ __html: visualization.html }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
