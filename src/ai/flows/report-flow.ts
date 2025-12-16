'use server';

/**
 * @fileOverview A Genkit flow for generating a consolidated threat intelligence report.
 * - generateReport - A function that takes an indicator and returns a summary and data from multiple sources.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { callVirusTotal } from './virustotal-flow';
import { callAbuseIPDB } from './abuseipdb-flow';
import { callSecurityTrails } from './securitytrails-flow';
import { callGreyNoise } from './greynoise-flow';
import { callShodan } from './shodan-flow';
import { callAlienVault } from './alienvault-flow';

const ReportInputSchema = z.object({
  indicator: z.string().describe('The indicator (IP, domain, URL, or hash) to generate a report for.'),
  services: z.array(z.string()).describe('A list of service IDs to use for the report.'),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

const ReportOutputSchema = z.object({
  summary: z.string().describe('A markdown-formatted summary of the threat intelligence findings.'),
  rawData: z.any().describe('The raw JSON data from all the queried services.'),
  chartData: z.array(z.object({
      name: z.string(),
      malicious: z.number(),
      suspicious: z.number(),
  })).describe('Data for the chart, typically from VirusTotal analysis results.')
});
export type ReportOutput = z.infer<typeof ReportOutputSchema>;

const serviceFlows: Record<string, (input: any) => Promise<any>> = {
  virustotal: (input: string) => callVirusTotal({ resource: input }),
  abuseipdb: (input: string) => callAbuseIPDB({ ipAddress: input }),
  securitytrails: (input: string) => callSecurityTrails({ resource: input }),
  greynoise: (input: string) => callGreyNoise({ ipAddress: input }),
  shodan: (input: string) => callShodan({ query: input }),
  alienvault: (input: string) => callAlienVault({ resource: input }),
};

const reportGenerationTool = ai.defineTool(
    {
      name: 'reportGenerationTool',
      description: 'Gathers data from multiple threat intelligence sources.',
      inputSchema: ReportInputSchema,
      outputSchema: z.any(),
    },
    async (input) => {
        const { indicator, services } = input;
        const promises = services.map(serviceId => {
            const flow = serviceFlows[serviceId];
            if (flow) {
                // Adjust input based on service expectations
                let serviceInput = indicator;
                if (serviceId === 'abuseipdb' || serviceId === 'greynoise') {
                   // These services expect an ipAddress
                   serviceInput = indicator;
                } else if (serviceId === 'shodan') {
                   serviceInput = indicator;
                } else {
                   serviceInput = indicator;
                }

                return flow(serviceInput).then(result => ({ [serviceId]: result })).catch(e => ({ [serviceId]: {error: e.message}}));
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

    const prompt = `
        You are a senior threat intelligence analyst. Based on the following data from various security services, 
        generate a concise, markdown-formatted summary for the indicator: "${input.indicator}".

        Your summary should include:
        - A high-level assessment of the indicator's risk.
        - Key findings from each service that returned data.
        - Specific details like reputation scores, malicious detections, and important WHOIS or network context.
        - Conclude with a recommendation for how to handle this indicator (e.g., block, monitor, allow).

        Here is the raw data:
        ${JSON.stringify(rawData, null, 2)}
    `;

    const { output: summary } = await ai.generate({
        prompt: prompt,
        model: 'googleai/gemini-2.5-flash',
    });
    
    let chartData = [];
    if (rawData.virustotal && rawData.virustotal.data) {
        const stats = rawData.virustotal.data.attributes.last_analysis_stats;
        chartData.push({
            name: "VT Analysis",
            malicious: stats.malicious,
            suspicious: stats.suspicious,
        });
    }


    return {
      summary: summary!.text!,
      rawData,
      chartData,
    };
  }
);

export async function generateReport(input: ReportInput): Promise<ReportOutput> {
  return await reportFlow(input);
}
