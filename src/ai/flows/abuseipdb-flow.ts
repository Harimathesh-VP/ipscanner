'use server';

/**
 * @fileOverview A function for interacting with the AbuseIPDB API.
 * - callAbuseIPDB - A function that takes an IP address and returns AbuseIPDB analysis.
 */

import { z } from 'zod';

const AbuseIPDBInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
  apiKey: z.string().optional().describe('The AbuseIPDB API key.'),
});
export type AbuseIPDBInput = z.infer<typeof AbuseIPDBInputSchema>;

export type AbuseIPDBOutput = any;

export async function callAbuseIPDB(input: AbuseIPDBInput): Promise<AbuseIPDBOutput> {
  const { ipAddress, apiKey } = input;
  const key = apiKey || process.env.ABUSEIPDB_API_KEY;
  if (!key) {
    throw new Error('AbuseIPDB API key is not provided or configured.');
  }
  
  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&maxAgeInDays=90&verbose=true`, {
      headers: { 'Key': key, 'Accept': 'application/json' },
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.errors[0]?.detail || `AbuseIPDB API error! status: ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error('Error calling AbuseIPDB API:', err.message);
    throw new Error(err.message || 'Failed to fetch data from AbuseIPDB.');
  }
}
