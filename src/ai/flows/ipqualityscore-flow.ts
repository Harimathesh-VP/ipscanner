'use server';

/**
 * @fileOverview A function for interacting with the IPQualityScore API.
 * - callIPQualityScore - A function that takes an IP address and returns IPQS analysis.
 */

import { z } from 'zod';

const IPQualityScoreInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
  apiKeys: z.record(z.string()).optional().describe('The IPQualityScore API key.'),
});
export type IPQualityScoreInput = z.infer<typeof IPQualityScoreInputSchema>;

export type IPQualityScoreOutput = any;

export async function callIPQualityScore(input: IPQualityScoreInput): Promise<IPQualityScoreOutput> {
  const { ipAddress, apiKeys } = input;
  const key = apiKeys?.ipqualityscore || process.env.IPQUALITYSCORE_API_KEY;
  if (!key) {
    throw new Error('IPQUALITYSCORE_API_KEY is not provided or configured.');
  }

  // Basic check for IP address
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ipAddress)) {
    throw new Error('Invalid IP address format provided.');
  }

  try {
    const response = await fetch(`https://ipqualityscore.com/api/json/ip/${key}/${ipAddress}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.message || `IPQualityScore API error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error calling IPQualityScore API:', err.message);
    throw new Error(err.message || 'Failed to fetch data from IPQualityScore.');
  }
}