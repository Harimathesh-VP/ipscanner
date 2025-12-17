'use server';

/**
 * @fileOverview A function for interacting with the AlienVault OTX API.
 * - callAlienVault - A function that takes a resource (IP, domain, hash) and returns OTX data.
 */

import { z } from 'zod';
import { callVirusTotal } from './virustotal-flow';

const AlienVaultInputSchema = z.object({
  resource: z.string().describe('The IP, domain, or hash to query.'),
  apiKeys: z.record(z.string()).optional().describe('The AlienVault OTX API key.'),
});
export type AlienVaultInput = z.infer<typeof AlienVaultInputSchema>;

export type AlienVaultOutput = any;

async function getIpWhoisFromRDAP(ip: string): Promise<string | null> {
    try
    {
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


export async function callAlienVault(input: AlienVaultInput): Promise<AlienVaultOutput> {
  const { resource, apiKeys } = input;
  const key = apiKeys?.alienvault || process.env.ALIENVAULT_API_KEY;
  if (!key) {
    throw new Error('ALIENVAULT_API_KEY is not provided or configured.');
  }

  let resourceType;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(resource);
  const isDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(resource);

  if (isIp) {
    resourceType = 'IPv4';
  } 
  else if (isDomain) {
    resourceType = 'domain';
  } 
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
       if (response.status === 404) {
         return { error: `Indicator '${resource}' not found in AlienVault OTX.` };
       }
      throw new Error(`AlienVault OTX API error! status: ${response.status}`);
    }
    
    let data = await response.json();

    if (isDomain) {
        try {
            const vtData = await callVirusTotal({ resource, apiKeys });
            if (vtData?.data?.attributes?.whois) {
                 data.whois_data = vtData.data.attributes.whois;
            }
        } catch (e: any) {
            console.log(`Could not fetch WHOIS from VirusTotal for ${resource}: ${e.message}`);
        }
    } else if (isIp) {
        const whoisData = await getIpWhoisFromRDAP(resource);
        if (whoisData) {
            data.whois_data = whoisData;
        }
    }


    return data;
  } catch (err: any) {
    console.error('Error calling AlienVault OTX API:', err.message);
    throw new Error('Failed to fetch data from AlienVault OTX.');
  }
}
