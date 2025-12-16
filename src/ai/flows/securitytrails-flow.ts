'use server';

/**
 * @fileOverview A Genkit flow for interacting with the SecurityTrails API.
 * - callSecurityTrails - A function that takes a resource (domain or IP) and returns SecurityTrails data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SecurityTrailsInputSchema = z.object({
  resource: z.string().describe('The domain or IP address to query.'),
  apiKey: z.string().optional().describe('The SecurityTrails API key.'),
});
export type SecurityTrailsInput = z.infer<typeof SecurityTrailsInputSchema>;

const SecurityTrailsOutputSchema = z.any().describe('The JSON response from the SecurityTrails API.');
export type SecurityTrailsOutput = z.infer<typeof SecurityTrailsOutputSchema>;

async function callApi(resource: string, apiKey?: string) {
  const key = apiKey || process.env.SECURITYTRAILS_API_KEY;
  if (!key) {
    throw new Error('SECURITYTRAILS_API_KEY is not provided or configured.');
  }

  let endpoint;
  // Basic check for IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(resource)) {
    endpoint = `https://api.securitytrails.com/v1/ip/${resource}`;
  } 
  // Assume domain
  else {
    endpoint = `https://api.securitytrails.com/v1/domain/${resource}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 
        'APIKEY': key,
        'Accept': 'application/json' 
      },
    });

    if (!response.ok) {
      throw new Error(`SecurityTrails API error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Also fetch WHOIS data for domains
    if (endpoint.includes('/domain/')) {
        const whoisResponse = await fetch(`${endpoint}/whois`, {
             headers: { 
                'APIKEY': key,
                'Accept': 'application/json' 
            },
        });
        if (whoisResponse.ok) {
            data.whois = await whoisResponse.json();
        }
    }

    return data;
  } catch (err: any) {
    console.error('Error calling SecurityTrails API:', err.message);
    throw new Error('Failed to fetch data from SecurityTrails.');
  }
}

const callSecurityTrailsTool = ai.defineTool(
    {
      name: 'callSecurityTrails',
      description: 'Calls the SecurityTrails API to get information about a resource.',
      inputSchema: SecurityTrailsInputSchema,
      outputSchema: SecurityTrailsOutputSchema,
    },
    async (input) => await callApi(input.resource, input.apiKey)
);

const securityTrailsFlow = ai.defineFlow(
  {
    name: 'securityTrailsFlow',
    inputSchema: SecurityTrailsInputSchema,
    outputSchema: SecurityTrailsOutputSchema,
  },
  async (input) => {
    const { output } = await callSecurityTrailsTool(input);
    return output;
  }
);

export async function callSecurityTrails(input: SecurityTrailsInput): Promise<SecurityTrailsOutput> {
  return await securityTrailsFlow(input);
}
