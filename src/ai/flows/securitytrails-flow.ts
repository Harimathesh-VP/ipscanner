'use server';

/**
 * @fileOverview A function for interacting with the SecurityTrails API.
 * - callSecurityTrails - A function that takes a resource (domain or IP) and returns SecurityTrails data.
 */

import { z } from 'zod';

const SecurityTrailsInputSchema = z.object({
  resource: z.string().describe('The domain or IP address to query.'),
  apiKeys: z.record(z.string()).optional().describe('The SecurityTrails API key.'),
});
export type SecurityTrailsInput = z.infer<typeof SecurityTrailsInputSchema>;

export type SecurityTrailsOutput = any;

export async function callSecurityTrails(input: SecurityTrailsInput): Promise<SecurityTrailsOutput> {
  const { resource, apiKeys } = input;
  const key = apiKeys?.securitytrails || process.env.SECURITYTRAILS_API_KEY;
  if (!key) {
    throw new Error('SECURITYTRAILS_API_KEY is not provided or configured.');
  }

  let endpoint;
  let isIp = false;
  // Basic check for IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(resource)) {
    endpoint = `https://api.securitytrails.com/v1/ip/${resource}/whois`;
    isIp = true;
  } 
  // Assume domain
  else {
    endpoint = `https://api.securitytrails.com/v1/domain/${resource}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 
        'APIKEY': key,
        'Accept': 'application/json' 
      },
    });

    if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.message || `SecurityTrails API error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // For IP addresses, the WHOIS data is the direct response.
    // For domains, we also fetch the separate WHOIS endpoint for more complete data.
    if (!isIp) {
        const whoisResponse = await fetch(`${endpoint}/whois`, {
             headers: { 
                'APIKEY': key,
                'Accept': 'application/json' 
            },
        });
        if (whoisResponse.ok) {
            data.whois_data = await whoisResponse.json();
        }
    } else {
        // The IP WHOIS response is the data itself. We wrap it to be consistent.
        return { whois: data };
    }


    return data;
  } catch (err: any) {
    console.error('Error calling SecurityTrails API:', err.message);
    throw new Error(err.message || 'Failed to fetch data from SecurityTrails.');
  }
}
