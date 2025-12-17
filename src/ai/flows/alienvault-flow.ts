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

function formatRdapToWhois(rdap: any): string {
    let output = '';
    const pad = (key: string) => key.padEnd(16, ' ');

    const main = [
        { key: 'NetRange', value: rdap.startAddress && rdap.endAddress ? `${rdap.startAddress} - ${rdap.endAddress}` : undefined },
        { key: 'CIDR', value: rdap.cidr0_cidrs?.[0]?.v4prefix },
        { key: 'NetName', value: rdap.name },
        { key: 'NetHandle', value: rdap.handle },
        { key: 'Parent', value: rdap.parentHandle },
        { key: 'NetType', value: rdap.type },
        { key: 'OriginAS', value: Array.isArray(rdap.autnums) && rdap.autnums.length > 0 ? rdap.autnums.map((a: any) => `AS${a.handle}`).join(', ') : undefined },
        { key: 'Organization', value: rdap.entities?.find((e: any) => e.roles.includes('registrant'))?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] },
        { key: 'RegDate', value: rdap.events?.find((e: any) => e.eventAction === 'registration')?.eventDate },
        { key: 'Updated', value: rdap.events?.find((e: any) => e.eventAction === 'last changed')?.eventDate },
        { key: 'Ref', value: rdap.links?.find((l: any) => l.rel === 'self')?.href },
    ];

    main.forEach(item => {
        if (item.value) {
            output += `${pad(item.key + ':')} ${item.value}\n`;
        }
    });

    if (rdap.remarks) {
        rdap.remarks.forEach((remark: any) => {
            output += `${pad('Comment:')} ${remark.title || ''}\n`;
            if (remark.description) {
                remark.description.forEach((desc: string) => {
                    output += `${pad('Comment:')} ${desc}\n`;
                });
            }
        });
    }

    const processEntity = (entity: any) => {
        let entityOutput = '\n';
        if (!entity.vcardArray || !Array.isArray(entity.vcardArray)) return '';
        const vcard = entity.vcardArray[1];

        const orgName = vcard.find((v: any) => v[0] === 'fn')?.[3];
        const orgId = entity.handle;

        const role = entity.roles?.[0] ? `Org${entity.roles[0].charAt(0).toUpperCase() + entity.roles[0].slice(1)}` : 'Org';

        if (orgName && orgId) {
           entityOutput += `${pad(role + 'Name:')} ${orgName}\n`;
           entityOutput += `${pad(role + 'ID:')} ${orgId}\n`;
        }
        
        const adr = vcard.find((v: any) => v[0] === 'adr')?.[3];
        if (adr && Array.isArray(adr)) {
            const addressParts = {
                street: adr[2],
                city: adr[3],
                state: adr[4],
                zip: adr[5],
                country: adr[6]
            };
            if(addressParts.street) entityOutput += `${pad('Address:')} ${addressParts.street}\n`;
            if(addressParts.city) entityOutput += `${pad('City:')} ${addressParts.city}\n`;
            if(addressParts.state) entityOutput += `${pad('StateProv:')} ${addressParts.state}\n`;
            if(addressParts.zip) entityOutput += `${pad('PostalCode:')} ${addressParts.zip}\n`;
            if(addressParts.country) entityOutput += `${pad('Country:')} ${addressParts.country}\n`;
        }

        const regDate = entity.events?.find((e: any) => e.eventAction === 'registration')?.eventDate;
        const lastChanged = entity.events?.find((e: any) => e.eventAction === 'last changed')?.eventDate;
        if(regDate) entityOutput += `${pad('RegDate:')} ${regDate}\n`;
        if(lastChanged) entityOutput += `${pad('Updated:')} ${lastChanged}\n`;

        if (entity.remarks) {
            entity.remarks.forEach((remark: any) => {
                remark.description.forEach((desc: string) => {
                     entityOutput += `${pad('Comment:')} ${desc}\n`;
                });
            });
        }


        const phone = vcard.find((v: any) => v[0] === 'tel')?.[3];
        if (phone) entityOutput += `${pad(role + 'Phone:')} ${phone.replace('tel:', '')}\n`;

        const email = vcard.find((v: any) => v[0] === 'email')?.[3];
        if (email) entityOutput += `${pad(role + 'Email:')} ${email}\n`;
        
        const ref = entity.links?.find((l: any) => l.rel === 'self')?.href;
        if (ref) entityOutput += `${pad(role + 'Ref:')} ${ref}\n`;
        
        // For specific contact handles like OrgTech, OrgAbuse
        if (entity.roles?.some((r: string) => ['technical', 'abuse'].includes(r))) {
            const handleName = `${role}Handle:`;
            entityOutput = `\n${pad(handleName)} ${orgId}\n` + entityOutput.trimStart();
        }

        return entityOutput;
    };
    
    if (rdap.entities) {
        const registrant = rdap.entities.find((e: any) => e.roles.includes('registrant'));
        const tech = rdap.entities.find((e: any) => e.roles.includes('technical'));
        const abuse = rdap.entities.find((e: any) => e.roles.includes('abuse'));
        
        if(registrant) output += processEntity(registrant);
        if(tech) output += processEntity(tech);
        if(abuse) output += processEntity(abuse);
    }

    return output.trim();
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
