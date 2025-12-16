'use server';

/**
 * @fileOverview A Genkit flow for interacting with the AlienVault OTX API.
 * - callAlienVault - A function that takes a resource (IP, domain, hash) and returns OTX data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AlienVaultInputSchema = z.object({
  resource: z.string().describe('The IP, domain, or hash to query.'),
});
export type AlienVaultInput = z.infer<typeof AlienVaultInputSchema>;

const AlienVaultOutputSchema = z.any().describe('The JSON response from the AlienVault OTX API.');
export type AlienVaultOutput = z.infer<typeof AlienVaultOutputSchema>;

async function callApi(resource: string) {
  const apiKey = process.env.ALIENVAULT_API_KEY;
  if (!apiKey) {
    throw new Error('ALIENVAULT_API_KEY is not set.');
  }

  let resourceType;
  // Basic check for IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(resource)) {
    resourceType = 'IPv4';
  } 
  // Basic check for domain
  else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(resource)) {
    resourceType = 'domain';
  } 
  // Assume hash otherwise
  else {
    resourceType = 'file';
  }

  const endpoint = `https://otx.alienvault.com/api/v1/indicators/${resourceType}/${resource}/general`;

  try {
    const response = await fetch(endpoint, {
      headers: { 
        'X-OTX-API-KEY': apiKey,
        'Accept': 'application/json' 
      },
    });

    if (!response.ok) {
      throw new Error(`AlienVault OTX API error! status: ${response.status}`);
    }
    
    const data = await response.json();

    // Also fetch whois for domains
    if (resourceType === 'domain' && data.whois) {
        const whoisResponse = await fetch(data.whois, {
            headers: { 'X-OTX-API-KEY': apiKey, 'Accept': 'application/json' }
        });
        if(whoisResponse.ok) {
            const whoisText = await whoisResponse.text();
            data.whois_data = whoisText;
        }
    }


    return data;
  } catch (err: any) {
    console.error('Error calling AlienVault OTX API:', err.message);
    throw new Error('Failed to fetch data from AlienVault OTX.');
  }
}

const callAlienVaultTool = ai.defineTool(
    {
      name: 'callAlienVault',
      description: 'Calls the AlienVault OTX API to get information about a resource.',
      inputSchema: AlienVaultInputSchema,
      outputSchema: AlienVaultOutputSchema,
    },
    async (input) => await callApi(input.resource)
);

const alienVaultFlow = ai.defineFlow(
  {
    name: 'alienVaultFlow',
    inputSchema: AlienVaultInputSchema,
    outputSchema: AlienVaultOutputSchema,
  },
  async (input) => {
    const { output } = await callAlienVaultTool(input);
    return output;
  }
);

export async function callAlienVault(input: AlienVaultInput): Promise<AlienVaultOutput> {
  return await alienVaultFlow(input);
}
