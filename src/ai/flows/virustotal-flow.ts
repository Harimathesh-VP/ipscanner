'use server';

/**
 * @fileOverview A function for interacting with the VirusTotal API.
 * - callVirusTotal - A function that takes a resource (domain, IP, URL) and returns VirusTotal analysis.
 */
import { z } from 'zod';

const VirusTotalInputSchema = z.object({
  resource: z.string().describe('The domain, IP address, or URL to query.'),
  apiKeys: z.record(z.string()).optional().describe('The VirusTotal API key.'),
});
export type VirusTotalInput = z.infer<typeof VirusTotalInputSchema>;

export type VirusTotalOutput = any;

function formatVtWhois(data: any): string {
    if (typeof data === 'string') {
        return data;
    }
    if (typeof data !== 'object' || data === null) {
        return 'Invalid WHOIS data format.';
    }

    let output = '';
    const keyOrder = [
        'Domain Name', 'Registry Domain ID', 'Registrar WHOIS Server', 'Registrar URL', 'Updated Date', 'Creation Date', 'Registrar Registration Expiration Date',
        'Registrar', 'Registrar IANA ID', 'Registrar Abuse Contact Email', 'Registrar Abuse Contact Phone',
        'Domain Status', 'Registry Registrant ID', 'Registrant Name', 'Registrant Organization',
        'Registrant Street', 'Registrant City', 'Registrant State/Province', 'Registrant Postal Code', 'Registrant Country',
        'Registrant Phone', 'Registrant Phone Ext', 'Registrant Fax', 'Registrant Fax Ext', 'Registrant Email'
    ];

    const processedKeys = new Set();

    // Add keys in specific order
    keyOrder.forEach(key => {
        const formattedKey = key.toLowerCase().replace(/ /g, '_');
        if (data[formattedKey]) {
            const label = `${key}:`.padEnd(30);
            output += `${label}${data[formattedKey]}\n`;
            processedKeys.add(formattedKey);
        } else if (data[key]) {
            const label = `${key}:`.padEnd(30);
            output += `${label}${data[key]}\n`;
            processedKeys.add(key);
        }
    });

    // Add remaining keys
    for (const key in data) {
        if (!processedKeys.has(key) && data[key]) {
            const label = `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:`.padEnd(30);
            const value = Array.isArray(data[key]) ? data[key].join(', ') : data[key];
            output += `${label}${value}\n`;
        }
    }

    return output;
}


export async function callVirusTotal(input: VirusTotalInput): Promise<VirusTotalOutput> {
  const { resource, apiKeys } = input;
  const key = apiKeys?.virustotal || process.env.VIRUSTOTAL_API_KEY;
  if (!key) {
    throw new Error('VIRUSTOTAL_API_KEY is not provided or configured.');
  }

  let url;
  let resourceType;
  try {
    // Basic check for IP address
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(resource)) {
      url = `https://www.virustotal.com/api/v3/ip_addresses/${resource}`;
      resourceType = 'ip_address';
    }
    // Basic check for domain
    else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(resource)) {
      url = `https://www.virustotal.com/api/v3/domains/${resource}`;
      resourceType = 'domain';
    }
    // Assume URL otherwise
    else {
       // VirusTotal requires URL to be base64 encoded without padding
       const encodedUrl = Buffer.from(resource).toString('base64').replace(/=/g, '');
       url = `https://www.virustotal.com/api/v3/urls/${encodedUrl}`;
       resourceType = 'url';
    }

    const mainResponse = await fetch(url, { headers: { 'x-apikey': key } });
    if (!mainResponse.ok) {
        throw new Error(`VirusTotal API error! status: ${mainResponse.status}`);
    }
    const mainData = await mainResponse.json();

    // For IPs and domains, fetch related data
    if (resourceType === 'ip_address') {
        const resolutionsResponse = await fetch(`${url}/resolutions`, { headers: { 'x-apikey': key } });
        if(resolutionsResponse.ok) mainData.data.attributes.resolutions = (await resolutionsResponse.json()).data;
    } else if (resourceType === 'domain') {
        const subdomainsResponse = await fetch(`${url}/subdomains`, { headers: { 'x-apikey': key } });
        if(subdomainsResponse.ok) mainData.data.attributes.subdomains = (await subdomainsResponse.json()).data;
        
        const whoisResponse = await fetch(`${url}/whois`, { headers: { 'x-apikey': key } });
        if(whoisResponse.ok) {
          const whoisData = (await whoisResponse.json()).data.attributes;
          mainData.data.attributes.whois = formatVtWhois(whoisData);
        }
    }

    return mainData;

  } catch (err: any)
   {
    console.error('Error calling VirusTotal API:', err.message);
    throw new Error('Failed to fetch data from VirusTotal.');
  }
}
