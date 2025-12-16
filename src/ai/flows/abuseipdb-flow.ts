'use server';

/**
 * @fileOverview A Genkit flow for interacting with the AbuseIPDB API.
 * - callAbuseIPDB - A function that takes an IP address and returns AbuseIPDB analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AbuseIPDBInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
});
export type AbuseIPDBInput = z.infer<typeof AbuseIPDBInputSchema>;

const AbuseIPDBOutputSchema = z.any().describe('The JSON response from the AbuseIPDB API.');
export type AbuseIPDBOutput = z.infer<typeof AbuseIPDBOutputSchema>;

async function callApi(ipAddress: string) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey) {
    throw new Error('ABUSEIPDB_API_KEY is not set.');
  }
  
  try {
    const whoisResponse = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&whois=true`, {
      headers: { 'Key': apiKey, 'Accept': 'application/json' },
    });

    if (!whoisResponse.ok) {
      throw new Error(`AbuseIPDB API error! status: ${whoisResponse.status}`);
    }

    const whoisData = await whoisResponse.json();

    const reportsResponse = await fetch(`https://api.abuseipdb.com/api/v2/reports?ipAddress=${ipAddress}&maxAgeInDays=90`, {
        headers: { 'Key': apiKey, 'Accept': 'application/json' },
      });

    if (!reportsResponse.ok) {
        console.error(`AbuseIPDB Reports API error! status: ${reportsResponse.status}`);
    }

    const reportsData = await reportsResponse.json();

    whoisData.data.reports = reportsData.data.results;
    
    return whoisData;
  } catch (err: any) {
    console.error('Error calling AbuseIPDB API:', err.message);
    throw new Error('Failed to fetch data from AbuseIPDB.');
  }
}

const callAbuseIPDBTool = ai.defineTool(
    {
      name: 'callAbuseIPDB',
      description: 'Calls the AbuseIPDB API to get information about an IP address.',
      inputSchema: AbuseIPDBInputSchema,
      outputSchema: AbuseIPDBOutputSchema,
    },
    async (input) => await callApi(input.ipAddress)
);

const abuseIPDBFlow = ai.defineFlow(
  {
    name: 'abuseIPDBFlow',
    inputSchema: AbuseIPDBInputSchema,
    outputSchema: AbuseIPDBOutputSchema,
  },
  async (input) => {
    const { output } = await callAbuseIPDBTool(input);
    return output;
  }
);

export async function callAbuseIPDB(input: AbuseIPDBInput): Promise<AbuseIPDBOutput> {
  return await abuseIPDBFlow(input);
}
