'use server';

/**
 * @fileOverview A function for interacting with the AlienVault OTX API.
 * - callAlienVault - A function that takes a resource (IP, domain, hash) and returns OTX data.
 */

import { z } from 'zod';

const AlienVaultInputSchema = z.object({
  resource: z.string().describe('The IP, domain, or hash to query.'),
  apiKey: z.string().optional().describe('The AlienVault OTX API key.'),
});
export type AlienVaultInput = z.infer<typeof AlienVaultInputSchema>;

export type AlienVaultOutput = any;

export async function callAlienVault(input: AlienVaultInput): Promise<AlienVaultOutput> {
  const { resource, apiKey } = input;
  const key = apiKey || process.env.ALIENVAULT_API_KEY;
  if (!key) {
    throw new Error('ALIENVAULT_API_KEY is not provided or configured.');
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
        'X-OTX-API-KEY': key,
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
            headers: { 'X-OTX-API-KEY': key, 'Accept': 'application/json' }
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
