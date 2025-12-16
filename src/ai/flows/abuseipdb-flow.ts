'use server';

/**
 * @fileOverview A function for interacting with the AbuseIPDB API, enriched with WHOIS data.
 * - callAbuseIPDB - A function that takes an IP address and returns AbuseIPDB analysis.
 */

import { z } from 'zod';
import { callSecurityTrails } from './securitytrails-flow';

const AbuseIPDBInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
  apiKeys: z.record(z.string()).optional().describe('A map of all available API keys.'),
});
export type AbuseIPDBInput = z.infer<typeof AbuseIPDBInputSchema>;

export type AbuseIPDBOutput = any;

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
    // Re-throw to be caught by the main report generator
    throw new Error(err.message || 'Failed to fetch data from AbuseIPDB.');
  }

  // Enrich with WHOIS data from SecurityTrails if the key is available
  const securityTrailsKey = apiKeys?.securitytrails || process.env.SECURITYTRAILS_API_KEY;
  if (securityTrailsKey && mainData.data) {
      try {
          const whoisData = await callSecurityTrails({ resource: ipAddress, apiKeys: { securitytrails: securityTrailsKey }});
          // SecurityTrails WHOIS for IP is directly in the response, not nested.
          if (whoisData && whoisData.whois) {
             mainData.data.whois = whoisData.whois;
          } else {
             // To ensure the WHOIS tab works, we format the object into a string.
             const whoisText = Object.entries(whoisData).map(([key, value]) => `${key}: ${value}`).join('\n');
             mainData.data.whois = whoisText;
          }
      } catch (e: any) {
          console.log(`Could not fetch WHOIS from SecurityTrails for ${ipAddress}: ${e.message}`);
          mainData.data.whois = 'Could not retrieve WHOIS data from SecurityTrails.';
      }
  }


  return mainData;
}