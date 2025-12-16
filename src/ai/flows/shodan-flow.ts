'use server';

/**
 * @fileOverview A Genkit flow for interacting with the Shodan API.
 * - callShodan - A function that takes an IP or query and returns Shodan data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ShodanInputSchema = z.object({
  query: z.string().describe('The IP address or search query.'),
  apiKey: z.string().optional().describe('The Shodan API key.'),
});
export type ShodanInput = z.infer<typeof ShodanInputSchema>;

const ShodanOutputSchema = z.any().describe('The JSON response from the Shodan API.');
export type ShodanOutput = z.infer<typeof ShodanOutputSchema>;

async function callApi(query: string, apiKey?: string) {
  const key = apiKey || process.env.SHODAN_API_KEY;
  if (!key) {
    throw new Error('SHODAN_API_KEY is not provided or configured.');
  }
  
  let endpoint;
  // Basic check for IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(query)) {
    endpoint = `https://api.shodan.io/shodan/host/${query}?key=${key}`;
  } 
  // Assume search query
  else {
    endpoint = `https://api.shodan.io/shodan/host/search?key=${key}&query=${encodeURIComponent(query)}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Shodan API error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error calling Shodan API:', err.message);
    throw new Error('Failed to fetch data from Shodan.');
  }
}

const callShodanTool = ai.defineTool(
    {
      name: 'callShodan',
      description: 'Calls the Shodan API to get information about an IP or query.',
      inputSchema: ShodanInputSchema,
      outputSchema: ShodanOutputSchema,
    },
    async (input) => await callApi(input.query, input.apiKey)
);

const shodanFlow = ai.defineFlow(
  {
    name: 'shodanFlow',
    inputSchema: ShodanInputSchema,
    outputSchema: ShodanOutputSchema,
  },
  async (input) => {
    const { output } = await callShodanTool(input);
    return output;
  }
);

export async function callShodan(input: ShodanInput): Promise<ShodanOutput> {
  return await shodanFlow(input);
}
