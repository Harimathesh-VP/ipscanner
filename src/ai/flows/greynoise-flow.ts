'use server';

/**
 * @fileOverview A function for interacting with the GreyNoise API.
 * - callGreyNoise - A function that takes an IP address and returns GreyNoise analysis.
 */

import { z } from 'zod';

const GreyNoiseInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
  apiKeys: z.record(z.string()).optional().describe('The GreyNoise API key.'),
});
export type GreyNoiseInput = z.infer<typeof GreyNoiseInputSchema>;

export type GreyNoiseOutput = any;

export async function callGreyNoise(input: GreyNoiseInput): Promise<GreyNoiseOutput> {
  const { ipAddress, apiKeys } = input;
  const key = apiKeys?.greynoise || process.env.GREYNOISE_API_KEY;
  if (!key) {
    throw new Error('GREYNOISE_API_KEY is not provided or configured.');
  }
  
  try {
    // Using the /v2/ips/{ip} endpoint for full context. This is the Enterprise endpoint,
    // which gracefully degrades for free/community keys by omitting fields.
    const response = await fetch(`https://api.greynoise.io/v2/ips/${ipAddress}`, {
      headers: { 'key': key, 'Accept': 'application/json' },
    });

    if (!response.ok) {
        if (response.status === 404) {
            // This is an expected case where GreyNoise has not seen the IP.
            // Return a normalized response indicating this.
            return { ip: ipAddress, noise: false, message: 'This IP address was not found in the GreyNoise dataset.' };
        }
       const errorData = await response.json();
       throw new Error(errorData.message || `GreyNoise API error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error calling GreyNoise API:', err.message);
    throw new Error(err.message || 'Failed to fetch data from GreyNoise.');
  }
}
