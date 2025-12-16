'use server';

/**
 * @fileOverview A function for interacting with the IBM X-Force Exchange API.
 * - callIBMForce - A function that takes a resource and returns X-Force data.
 */

import { z } from 'zod';

const IBMXForceInputSchema = z.object({
  resource: z.string().describe('The IP, URL, or hash to query.'),
  apiKeys: z.record(z.string()).optional().describe('The IBM X-Force API key.'),
});
export type IBMXForceInput = z.infer<typeof IBMXForceInputSchema>;

export type IBMXForceOutput = any;

export async function callIBMForce(input: IBMXForceInput): Promise<IBMXForceOutput> {
  const { resource, apiKeys } = input;
  const apiKey = apiKeys?.xforce;
  
  if (!apiKey) {
    throw new Error('XFORCE_API_KEY is not provided or configured.');
  }

  // The API key is often a combination of key and password, base64 encoded.
  // This is a common pattern for IBM X-Force.
  const credentials = Buffer.from(apiKey).toString('base64');
  
  let endpoint;
  // Basic check for IP address
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(resource)) {
    endpoint = `https://api.xforce.ibmcloud.com/ipr/${resource}`;
  } 
  // Basic check for URL
  else if (resource.startsWith('http')) {
     endpoint = `https://api.xforce.ibmcloud.com/url/${resource}`;
  }
  // Assume hash
  else {
    endpoint = `https://api.xforce.ibmcloud.com/malware/${resource}`;
  }

  try {
    const response = await fetch(endpoint, {
      headers: { 
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json' 
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IBM X-Force API error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (err: any) {
    console.error('Error calling IBM X-Force API:', err.message);
    throw new Error('Failed to fetch data from IBM X-Force.');
  }
}