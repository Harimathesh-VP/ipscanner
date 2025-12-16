'use server';

/**
 * @fileOverview A Genkit flow for generating a consolidated threat intelligence report.
 * - generateReport - A function that takes an indicator and returns data from multiple sources.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callVirusTotal } from './virustotal-flow';
import { callAbuseIPDB } from './abuseipdb-flow';
import { callSecurityTrails } from './securitytrails-flow';
import { callGreyNoise } from './greynoise-flow';
import { callShodan } from './shodan-flow';
import { callAlienVault } from './alienvault-flow';
import { services } from '@/lib/services';

const ReportInputSchema = z.object({
  indicator: z.string().describe('The indicator (IP, domain, URL, or hash) to generate a report for.'),
  selectedServices: z.array(z.string()).describe('A list of service IDs to use for the report.'),
  apiKeys: z.record(z.string()).describe('A map of service IDs to their API keys.'),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

const ReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the threat intelligence findings.'),
  rawData: z.any().describe('The raw JSON data from all the queried services.'),
  chartData: z.array(z.object({
      name: z.string(),
      malicious: z.number(),
      suspicious: z.number(),
  })).describe('Data for the chart, typically from VirusTotal analysis results.')
});
export type ReportOutput = z.infer<typeof ReportOutputSchema>;

const serviceFlows: Record<string, (input: any) => Promise<any>> = {
  virustotal: (input: any) => callVirusTotal(input),
  abuseipdb: (input: any) => callAbuseIPDB(input),
  securitytrails: (input: any) => callSecurityTrails(input),
  greynoise: (input: any) => callGreyNoise(input),
  shodan: (input: any) => callShodan(input),
  alienvault: (input: any) => callAlienVault(input),
};

const reportGenerationTool = ai.defineTool(
    {
      name: 'reportGenerationTool',
      description: 'Gathers data from multiple threat intelligence sources.',
      inputSchema: ReportInputSchema,
      outputSchema: z.any(),
    },
    async (input) => {
        const { indicator, selectedServices, apiKeys } = input;
        
        const promises = selectedServices.map(serviceId => {
            const flow = serviceFlows[serviceId];
            if (flow) {
                const service = services.find(s => s.id === serviceId);
                if (!service) return Promise.resolve({ [serviceId]: { error: 'Unknown service' } });

                const apiKey = apiKeys[serviceId];
                if (!apiKey) {
                    return Promise.resolve({ [serviceId]: { error: 'API key not configured for this service.' }});
                }
                
                let serviceInput: any;

                if (service.inputType === 'ipAddress') {
                   serviceInput = { ipAddress: indicator, apiKey };
                } else if (service.inputType === 'query') {
                   serviceInput = { query: indicator, apiKey };
                } else {
                   serviceInput = { resource: indicator, apiKey };
                }

                return flow(serviceInput)
                  .then(result => ({ [serviceId]: result }))
                  .catch(e => ({ [serviceId]: {error: e.message}}));
            }
            return Promise.resolve({ [serviceId]: { error: 'Not implemented' } });
        });

        const results = await Promise.all(promises);
        return results.reduce((acc, current) => ({ ...acc, ...current }), {});
    }
);


const reportFlow = ai.defineFlow(
  {
    name: 'reportFlow',
    inputSchema: ReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async (input) => {
    const rawData = await reportGenerationTool(input);
    
    // Create a simple summary based on which services returned data.
    const successfulServices = Object.entries(rawData)
      .filter(([_, result]) => result && !result.error)
      .map(([serviceId, _]) => services.find(s => s.id === serviceId)?.name)
      .filter(Boolean);

    const failedServices = Object.entries(rawData)
      .filter(([_, result]) => result && result.error)
      .map(([serviceId, _]) => services.find(s => s.id === serviceId)?.name)
      .filter(Boolean);

    let summary = `Report for indicator: **${input.indicator}**\n\n`;
    if (successfulServices.length > 0) {
      summary += `Successfully retrieved data from: ${successfulServices.join(', ')}.\n\n`;
    }
    if (failedServices.length > 0) {
       summary += `Failed to retrieve data from: ${failedServices.join(', ')}. Check API key configuration.\n\n`;
    }
    summary += "See the raw data section for full details.";


    let chartData = [];
    if (rawData.virustotal && rawData.virustotal.data && rawData.virustotal.data.attributes) {
        const stats = rawData.virustotal.data.attributes.last_analysis_stats;
        if(stats) {
            chartData.push({
                name: "VT Analysis",
                malicious: stats.malicious || 0,
                suspicious: stats.suspicious || 0,
            });
        }
    }


    return {
      summary,
      rawData,
      chartData,
    };
  }
);

export async function generateReport(input: ReportInput): Promise<ReportOutput> {
  return await reportFlow(input);
}
