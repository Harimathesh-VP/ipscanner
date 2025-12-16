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

  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(resource);
  const endpoint = `https://api.securitytrails.com/v1/${isIp ? 'ip' : 'domain'}/${resource}`;

  try {
    const mainResponse = await fetch(endpoint, {
      headers: { 
        'APIKEY': key,
        'Accept': 'application/json' 
      },
    });

    if (!mainResponse.ok) {
       const errorData = await mainResponse.json();
       throw new Error(errorData.message || `SecurityTrails API error! status: ${mainResponse.status}`);
    }
    
    const data = await mainResponse.json();
    
    // For both IPs and domains, fetch WHOIS separately for consistency,
    // as sometimes it's nested and sometimes it's not.
    // This also avoids making simultaneous calls that might fail.
    if (!data.whois) {
        const whoisResponse = await fetch(`${endpoint}/whois`, {
            headers: { 'APIKEY': key, 'Accept': 'application/json' },
        });
        if (whoisResponse.ok) {
            data.whois = await whoisResponse.json();
        }
    }

    return data;
  } catch (err: any) {
    console.error('Error calling SecurityTrails API:', err.message);
    throw new Error(err.message || 'Failed to fetch data from SecurityTrails.');
  }
}
