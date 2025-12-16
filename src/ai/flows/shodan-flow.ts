'use server';

/**
 * @fileOverview A function for interacting with the Shodan API.
 * - callShodan - A function that takes an IP or query and returns Shodan data.
 */

import { z } from 'zod';

const ShodanInputSchema = z.object({
  query: z.string().describe('The IP address or search query.'),
  apiKey: z.string().optional().describe('The Shodan API key.'),
});
export type ShodanInput = z.infer<typeof ShodanInputSchema>;

export type ShodanOutput = any;

export async function callShodan(input: ShodanInput): Promise<ShodanOutput> {
  const { query, apiKey } = input;
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
    endpoint = `https://api.shodan.io/shodan/host/search?query=${encodeURIComponent(query)}&key=${key}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Shodan API error! status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage += ` - ${errorJson.error}`;
        }
      } catch (e) {
        errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error calling Shodan API:', err.message);
    // Re-throw the original error which might be more specific.
    throw new Error(err.message || 'Failed to fetch data from Shodan.');
  }
}
