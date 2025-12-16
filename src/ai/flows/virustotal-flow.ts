'use server';

/**
 * @fileOverview A Genkit flow for interacting with the VirusTotal API.
 * - callVirusTotal - A function that takes a resource (domain, IP, URL) and returns VirusTotal analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VirusTotalInputSchema = z.object({
  resource: z.string().describe('The domain, IP address, or URL to query.'),
});
export type VirusTotalInput = z.infer<typeof VirusTotalInputSchema>;

const VirusTotalOutputSchema = z.any().describe('The JSON response from the VirusTotal API.');
export type VirusTotalOutput = z.infer<typeof VirusTotalOutputSchema>;

async function callApi(resource: string) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    throw new Error('VIRUSTOTAL_API_KEY is not set.');
  }

  let url;
  try {
    // Basic check for IP address
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(resource)) {
      url = `https://www.virustotal.com/api/v3/ip_addresses/${resource}`;
    } 
    // Basic check for domain
    else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(resource)) {
      url = `https://www.virustotal.com/api/v3/domains/${resource}`;
    } 
    // Assume URL otherwise
    else {
      // VirusTotal requires URL to be base64 encoded without padding
      const encodedUrl = Buffer.from(resource).toString('base64').replace(/=/g, '');
      url = `https://www.virustotal.com/api/v3/urls/${encodedUrl}`;
    }
    
    // Add whois lookup for domains and IPs
    if (url.includes('ip_addresses') || url.includes('domains')) {
        const whoisUrl = `${url}/whois`;
        const whoisResponse = await fetch(whoisUrl, { headers: { 'x-apikey': apiKey } });
        if (!whoisResponse.ok) {
            console.error(`VirusTotal WHOIS API error! status: ${whoisResponse.status}`);
        }
        const whoisData = await whoisResponse.json();

        const mainResponse = await fetch(url, { headers: { 'x-apikey': apiKey } });
        if (!mainResponse.ok) {
            throw new Error(`VirusTotal API error! status: ${mainResponse.status}`);
        }
        const mainData = await mainResponse.json();
        
        mainData.data.attributes.whois = whoisData?.data?.attributes?.whois;
        return mainData;

    } else {
         const response = await fetch(url, { headers: { 'x-apikey': apiKey } });
        if (!response.ok) {
            throw new Error(`VirusTotal API error! status: ${response.status}`);
        }
        return response.json();
    }


  } catch (err: any) {
    console.error('Error calling VirusTotal API:', err.message);
    throw new Error('Failed to fetch data from VirusTotal.');
  }
}

const callVirusTotalTool = ai.defineTool(
    {
      name: 'callVirusTotal',
      description: 'Calls the VirusTotal API to get information about a resource.',
      inputSchema: VirusTotalInputSchema,
      outputSchema: VirusTotalOutputSchema,
    },
    async (input) => await callApi(input.resource)
);

const virusTotalFlow = ai.defineFlow(
  {
    name: 'virusTotalFlow',
    inputSchema: VirusTotalInputSchema,
    outputSchema: VirusTotalOutputSchema,
  },
  async (input) => {
    const { output } = await callVirusTotalTool(input);
    return output;
  }
);

export async function callVirusTotal(input: VirusTotalInput): Promise<VirusTotalOutput> {
  return await virusTotalFlow(input);
}
