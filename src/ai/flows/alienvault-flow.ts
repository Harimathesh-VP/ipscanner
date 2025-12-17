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

function formatRdapToWhois(rdapJson: any): string {
    let output = '';
    const pad = (s: string) => s.padEnd(16, ' ');

    if (rdapJson.handle) output += `${pad('NetHandle:')} ${rdapJson.handle}\n`;
    if (rdapJson.startAddress && rdapJson.endAddress) output += `${pad('NetRange:')} ${rdapJson.startAddress} - ${rdapJson.endAddress}\n`;
    if (rdapJson.ipVersion) output += `${pad('IPVersion:')} ${rdapJson.ipVersion}\n`;
    if (rdapJson.name) output += `${pad('NetName:')} ${rdapJson.name}\n`;
    if (rdapJson.parentHandle) output += `${pad('Parent:')} ${rdapJson.parentHandle}\n`;
    if (rdapJson.objectClassName) output += `${pad('ObjectClass:')} ${rdapJson.objectClassName}\n`;

    if (rdapJson.events) {
        const regDate = rdapJson.events.find((e: any) => e.eventAction === 'registration');
        const updateDate = rdapJson.events.find((e: any) => e.eventAction === 'last changed');
        if (regDate) output += `${pad('RegDate:')} ${new Date(regDate.eventDate).toISOString()}\n`;
        if (updateDate) output += `${pad('Updated:')} ${new Date(updateDate.eventDate).toISOString()}\n`;
    }

    if (rdapJson.remarks) {
        rdapJson.remarks.forEach((remark: any) => {
            output += `${pad('Comment:')} ${remark.title || ''}\n`;
            if (remark.description) {
                remark.description.forEach((desc: string) => {
                    output += `${pad('Comment:')} ${desc}\n`;
                });
            }
        });
    }

    if (rdapJson.entities) {
        rdapJson.entities.forEach((entity: any) => {
            output += '\n';
            if (!entity.vcardArray || !Array.isArray(entity.vcardArray)) return;
            const vcard = entity.vcardArray[1];

            const name = vcard.find((v: any) => v[0] === 'fn')?.[3];
            const email = vcard.find((v: any) => v[0] === 'email')?.[3];
            const addressVcard = vcard.find((v: any) => v[0] === 'adr');
            const phone = vcard.find((v: any) => v[0] === 'tel')?.[3];
            
            const roles = entity.roles?.map((r: string) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ');
            const orgTitle = name ? `${name} (${entity.handle})` : entity.handle;
            output += `Organisation:   ${orgTitle} ${roles ? `[${roles}]`: ''}\n`;

            if (addressVcard && Array.isArray(addressVcard[3])) {
                const addressParts = addressVcard[3];
                const [street, city, state, zip, country] = addressParts.map(part => part || null);

                if (street) output += `${pad('Address:')} ${street}\n`;
                if (city && state && zip) output += `${pad('')} ${city}, ${state} ${zip}\n`;
                if (country) output += `${pad('')} ${country}\n`;
            }

            if (phone) output += `${pad('Phone:')} ${phone}\n`;
            if (email) output += `${pad('Email:')} ${email}\n`;

        });
    }

    return output;
}


async function getIpWhoisFromRDAP(ip: string): Promise<string | null> {
    try {
        const rdapResponse = await fetch(`https://rdap.arin.net/registry/ip/${ip}`);
        if (rdapResponse.ok) {
            const rdapJson = await rdapResponse.json();
            return formatRdapToWhois(rdapJson);
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
