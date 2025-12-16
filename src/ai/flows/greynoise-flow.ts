'use server';

/**
 * @fileOverview A Genkit flow for interacting with the GreyNoise API.
 * - callGreyNoise - A function that takes an IP address and returns GreyNoise analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GreyNoiseInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
});
export type GreyNoiseInput = z.infer<typeof GreyNoiseInputSchema>;

const GreyNoiseOutputSchema = z.any().describe('The JSON response from the GreyNoise API.');
export type GreyNoiseOutput = z.infer<typeof GreyNoiseOutputSchema>;

async function callApi(ipAddress: string) {
  const apiKey = process.env.GREYNOISE_API_KEY;
  if (!apiKey) {
    throw new Error('GREYNOISE_API_KEY is not set.');
  }
  
  try {
    const response = await fetch(`https://api.greynoise.io/v3/community/${ipAddress}`, {
      headers: { 'key': apiKey, 'Accept': 'application/json' },
    });

    if (!response.ok) {
        if (response.status === 404) {
            return { message: 'This IP address was not found in the GreyNoise dataset.' };
        }
      throw new Error(`GreyNoise API error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error calling GreyNoise API:', err.message);
    throw new Error('Failed to fetch data from GreyNoise.');
  }
}

const callGreyNoiseTool = ai.defineTool(
    {
      name: 'callGreyNoise',
      description: 'Calls the GreyNoise API to get information about an IP address.',
      inputSchema: GreyNoiseInputSchema,
      outputSchema: GreyNoiseOutputSchema,
    },
    async (input) => await callApi(input.ipAddress)
);

const greyNoiseFlow = ai.defineFlow(
  {
    name: 'greyNoiseFlow',
    inputSchema: GreyNoiseInputSchema,
    outputSchema: GreyNoiseOutputSchema,
  },
  async (input) => {
    const { output } = await callGreyNoiseTool(input);
    return output;
  }
);

export async function callGreyNoise(input: GreyNoiseInput): Promise<GreyNoiseOutput> {
  return await greyNoiseFlow(input);
}
