'use server';

/**
 * @fileOverview A function for interacting with the AbuseIPDB API, enriched with WHOIS data.
 * - callAbuseIPDB - A function that takes an IP address and returns AbuseIPDB analysis.
 */

import { z } from 'zod';

const AbuseIPDBInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
  apiKeys: z.record(z.string()).optional().describe('A map of all available API keys.'),
});
export type AbuseIPDBInput = z.infer<typeof AbuseIPDBInputSchema>;

export type AbuseIPDBOutput = any;

async function getIpWhoisFromRDAP(ip: string): Promise<string | null> {
    try {
        const rdapResponse = await fetch(`https://rdap.arin.net/registry/ip/${ip}`);
        if (rdapResponse.ok) {
            const rdapJson = await rdapResponse.json();
            return JSON.stringify(rdapJson, null, 2);
        }
        return `Could not fetch WHOIS from RDAP. Status: ${rdapResponse.status}`;
    } catch (e: any) {
        console.log(`Could not fetch WHOIS from RDAP for ${ip}: ${e.message}`);
        return `Error fetching WHOIS from RDAP: ${e.message}`;
    }
}


export async function callAbuseIPDB(input: AbuseIPDBInput): Promise<AbuseIPDBOutput> {
  const { ipAddress, apiKeys } = input;
  const abuseIPDBKey = apiKeys?.abuseipdb || process.env.ABUSEIPDB_API_KEY;

  if (!abuseIPDBKey) {
    throw new Error('AbuseIPDB API key is not provided or configured.');
  }

  let mainData: any;

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ipAddress}&maxAgeInDays=90&verbose`, {
      headers: { 'Key': abuseIPDBKey, 'Accept': 'application/json' },
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.errors[0]?.detail || `AbuseIPDB API error! status: ${response.status}`);
    }

    mainData = await response.json();
  } catch (err: any) {
    console.error('Error calling AbuseIPDB API:', err.message);
    throw new Error(err.message || 'Failed to fetch data from AbuseIPDB.');
  }

  if (mainData.data) {
      try {
          const whoisData = await getIpWhoisFromRDAP(ipAddress);
          mainData.data.whois = whoisData;
      } catch (e: any) {
          console.log(`Could not fetch WHOIS from RDAP for ${ipAddress}: ${e.message}`);
          mainData.data.whois = 'Could not retrieve WHOIS data.';
      }
  }


  return mainData;
}
