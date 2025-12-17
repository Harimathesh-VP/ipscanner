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

function formatVtWhois(whoisString: string): string {
    // This function assumes the input is a raw WHOIS text string.
    // It can be expanded to parse structured data if VT provides it.
    if (typeof whoisString !== 'string') {
        try {
          // If it's an object, try to stringify it prettily.
          // This is a fallback and might not match the desired format perfectly.
          return JSON.stringify(whoisString, null, 2);
        } catch {
          return 'Invalid WHOIS data format.';
        }
    }

    // Split into lines and format.
    const lines = whoisString.split('\n');
    let formatted = '';
    let longestKey = 0;
    
    const parsedLines = lines.map(line => {
        const parts = line.split(/:\s+/);
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            if (key.length > longestKey && !key.startsWith('%') && !key.startsWith('#')) {
                longestKey = key.length;
            }
            return { key, value };
        }
        return { raw: line };
    }).filter(l => (l.key && l.value) || (l.raw && l.raw.trim() !== ''));

    parsedLines.forEach(line => {
        if (line.key && line.value) {
            // Don't pad comments or special lines
            if (line.key.toLowerCase() === 'comment' || line.key.startsWith('remarks')) {
                 formatted += `${line.key}:${' '.repeat(16 - line.key.length -1)} ${line.value}\n`;
            } else {
                 formatted += `${line.key.padEnd(16, ' ')}: ${line.value}\n`;
            }
        } else if (line.raw) {
            formatted += `${line.raw}\n`;
        }
    });

    return formatted.trim();
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
          const whoisData = (await whoisResponse.json()).data.attributes.whois;
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
