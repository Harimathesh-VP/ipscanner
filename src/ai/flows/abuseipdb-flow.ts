'use server';

/**
 * @fileOverview A function for interacting with the AbuseIPDB API, enriched with WHOIS data.
 * - callAbuseIPDB - A function that takes an IP address and returns AbuseIPDB analysis.
 */

import { z } from 'zod';

const AbuseIPDBInputSchema = z.object({
  ipAddress: z.string().describe('The IP address to query.'),
  apiKeys: z.record(z.string()).optional().describe('A map of all available API keys.'),
});
export type AbuseIPDBInput = z.infer<typeof AbuseIPDBInputSchema>;

export type AbuseIPDBOutput = any;


function formatRdapToWhois(rdap: any): string {
    let output = '';
    const pad = (key: string, length = 16) => key.padEnd(length, ' ');

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
            output += `\n${pad('Comment:')} ${remark.title || ''}\n`;
            if (remark.description) {
                remark.description.forEach((desc: string) => {
                    output += `${pad('Comment:')} ${desc}\n`;
                });
            }
        });
    }

    const processEntity = (entity: any) => {
        if (!entity?.vcardArray?.[1]) return '';
        const vcard = entity.vcardArray[1];
        
        let entityOutput = '\n';
        
        const orgName = vcard.find((v: any) => v[0] === 'fn')?.[3];
        const orgId = entity.handle;

        const role = entity.roles?.[0] ? `Org${entity.roles[0].charAt(0).toUpperCase() + entity.roles[0].slice(1)}` : 'Org';

        const roleHandle = `${role}Handle:`;
        const roleName = `${role}Name:`;
        const rolePhone = `${role}Phone:`;
        const roleEmail = `${role}Email:`;
        const roleRef = `${role}Ref:`;

        if (orgName && orgId) {
            if (entity.roles?.includes('technical') || entity.roles?.includes('abuse')) {
                entityOutput += `${pad(roleHandle)} ${orgId}\n`;
            }
           entityOutput += `${pad(roleName)} ${orgName}\n`;
           if(!entity.roles?.includes('technical') && !entity.roles?.includes('abuse')) {
                entityOutput += `${pad('OrgId:')} ${orgId}\n`;
           }
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
                 if (remark.description) {
                    remark.description.forEach((desc: string) => {
                        entityOutput += `${pad('Comment:')} ${desc}\n`;
                    });
                }
            });
        }

        const phone = vcard.find((v: any) => v[0] === 'tel')?.[3];
        if (phone) entityOutput += `${pad(rolePhone)} ${phone.replace('tel:', '')}\n`;

        const email = vcard.find((v: any) => v[0] === 'email')?.[3];
        if (email) entityOutput += `${pad(roleEmail)} ${email}\n`;
        
        const ref = entity.links?.find((l: any) => l.rel === 'self')?.href;
        if (ref) entityOutput += `${pad(roleRef)} ${ref}\n`;
        
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
    throw new Error(err.message || 'Failed to fetch data from AbuseIPDB.');
  }

  if (mainData.data) {
      try {
          const whoisData = await getIpWhoisFromRDAP(ipAddress);
          mainData.data.whois = whoisData;
      } catch (e: any) {
          console.log(`Could not fetch WHOIS from RDAP for ${ipAddress}: ${e.message}`);
          mainData.data.whois = 'Could not retrieve WHOIS data.';
      }
  }


  return mainData;
}
