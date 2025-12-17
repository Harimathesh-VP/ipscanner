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


function formatRdapToWhois(rdapJson: any): string {
  let output = '';
  if (rdapJson.handle) output += `NetHandle:      ${rdapJson.handle}\n`;
  if (rdapJson.startAddress && rdapJson.endAddress) output += `NetRange:       ${rdapJson.startAddress} - ${rdapJson.endAddress}\n`;
  if (rdapJson.ipVersion) output += `NetType:        ${rdapJson.ipVersion}\n`;
  if (rdapJson.name) output += `NetName:        ${rdapJson.name}\n`;
  if (rdapJson.parentHandle) output += `Parent:         ${rdapJson.parentHandle}\n`;
  if (rdapJson.objectClassName) output += `NetType:        ${rdapJson.objectClassName}\n`;

  if (rdapJson.events) {
    const regDate = rdapJson.events.find((e: any) => e.eventAction === 'registration');
    const updateDate = rdapJson.events.find((e: any) => e.eventAction === 'last changed');
    if (regDate) output += `RegDate:        ${new Date(regDate.eventDate).toISOString()}\n`;
    if (updateDate) output += `Updated:        ${new Date(updateDate.eventDate).toISOString()}\n`;
  }
  
  if (rdapJson.remarks) {
      rdapJson.remarks.forEach((remark: any) => {
          output += `Comment:        ${remark.title || ''}\n`;
          if (remark.description) {
            remark.description.forEach((desc: string) => {
                 output += `Comment:        ${desc}\n`
            });
          }
      });
  }


  if (rdapJson.entities) {
    rdapJson.entities.forEach((entity: any) => {
      output += '\n';
      if (entity.handle) output += `OrgHandle:      ${entity.handle}\n`;
      if (entity.roles) output += `OrgID:          ${entity.roles.join(', ')}\n`;
      
      const vcard = entity.vcardArray?.[1];
      if (vcard) {
         const name = vcard.find((v: any) => v[0] === 'fn')?.[3];
         const email = vcard.find((v: any) => v[0] === 'email')?.[3];
         const address = vcard.find((v: any) => v[0] === 'adr')?.[3];
         const phone = vcard.find((v: any) => v[0] === 'tel')?.[3];

         if(name) output += `OrgName:        ${name}\n`;
         if(address) output += `Address:        ${address.join(', ')}\n`;
         if(phone) output += `OrgPhone:       ${phone}\n`;
         if(email) output += `OrgEmail:       ${email}\n`;
      }
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
