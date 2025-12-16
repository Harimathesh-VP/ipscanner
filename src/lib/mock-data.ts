import type { RequestLog } from './types';

export const mockApiResponses: Record<string, any> = {
  virustotal: {
    data: {
      attributes: {
        last_analysis_stats: {
          harmless: 68,
          malicious: 2,
          suspicious: 0,
          undetected: 11,
          timeout: 0,
        },
        reputation: 650,
        tags: ["c2", "malware"],
        total_votes: {
          harmless: 5,
          malicious: 2,
        },
        whois: 'Domain Name: google.com\nRegistry Domain ID: 2138514_DOMAIN_COM-VRSN\nRegistrar WHOIS Server: whois.markmonitor.com\nRegistrar URL: http://www.markmonitor.com\nUpdated Date: 2023-09-07T15:22:14-0700\nCreation Date: 1997-09-15T00:00:00-0700\nRegistrar Registration Expiration Date: 2028-09-13T21:00:00-0700\nRegistrar: MarkMonitor, Inc.\nRegistrar IANA ID: 292\nRegistrar Abuse Contact Email: abusecomplaints@markmonitor.com\nRegistrar Abuse Contact Phone: +1.2083895740\nDomain Status: clientDeleteProhibited https://www.icann.org/epp#clientDeleteProhibited\nDomain Status: clientTransferProhibited https://www.icann.org/epp#clientTransferProhibited\nDomain Status: clientUpdateProhibited https://www.icann.org/epp#clientUpdateProhibited\nDomain Status: serverDeleteProhibited https://www.icann.org/epp#serverDeleteProhibited\nDomain Status: serverTransferProhibited https://www.icann.org/epp#serverTransferProhibited\nDomain Status: serverUpdateProhibited https://www.icann.org/epp#serverUpdateProhibited\nName Server: ns1.google.com\nName Server: ns2.google.com\nName Server: ns3.google.com\nName Server: ns4.google.com\nDNSSEC: unsigned\nURL of the ICANN WHOIS Data Problem Reporting System: http://wdprs.internic.net/\n>>> Last update of WHOIS database: 2024-03-05T17:22:24-0800 <<<',
      },
    },
  },
  abuseipdb: {
    data: {
      ipAddress: '8.8.8.8',
      isPublic: true,
      abuseConfidenceScore: 90,
      countryCode: 'US',
      usageType: 'Data Center/Web Hosting/Transit',
      isp: 'Google LLC',
      domain: 'google.com',
      totalReports: 1234,
      isWhitelisted: false,
      lastReportedAt: "2024-03-05T10:00:00+00:00",
      reports: [
        {
          reportedAt: "2024-03-05T10:00:00+00:00",
          comment: "SSH brute-force",
          categories: [22],
          reporterId: 1,
          reporterCountryCode: "US",
          reporterCountryName: "United States"
        },
        {
          reportedAt: "2024-03-04T10:00:00+00:00",
          comment: "Port scanning",
          categories: [14],
          reporterId: 2,
          reporterCountryCode: "DE",
          reporterCountryName: "Germany"
        }
      ],
      whois: "NetRange: 8.8.8.0 - 8.8.8.255\nCIDR: 8.8.8.0/24\nNetName: GOOGLE\nNetHandle: NET-8-8-8-0-1\nParent: NET-8-0-0-0-0\nNetType: DIRECT ALLOCATION\nOriginAS: AS15169\nOrganization: Google LLC (GOGL)\nRegDate: 2009-08-14\nUpdated: 2012-02-24\nComment: The activity you have detected originates from a dynamic hosting environment. For fastest response, please submit abuse reports at http://www.google.com/abuse. \nRef: https://rdap.arin.net/registry/ip/8.8.8.8"
    },
  },
  securitytrails: {
    endpoints: {
      domain: {
        current_dns: {
          a: {
            values: [{ ip: '142.250.191.78' }],
          },
          mx: {
            values: [{ hostname: 'smtp.google.com' }],
          },
        },
      },
    },
  },
  greynoise: {
    ip: '8.8.8.8',
    noise: false,
    riot: false,
    classification: 'benign',
    name: 'Google Public DNS',
    link: 'https://viz.greynoise.io/ip/8.8.8.8',
  },
  shodan: {
    region_code: 'CA',
    ip: 3486784408,
    area_code: 0,
    country_name: 'United States',
    hostnames: ['dns.google'],
    city: 'Mountain View',
    org: 'Google',
    data: '...',
  },
  alienvault: {
    general: {
      indicator: 'google.com',
      type: 'domain',
      pulse_info: {
        count: 123,
        pulses: [
          { name: 'Google Safe Browsing' },
          { name: 'PhishTank' },
        ],
      },
    },
  },
};

export const mockRequestLogs: RequestLog[] = [
  {
    id: '1',
    service: 'VirusTotal',
    target: 'google.com',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: mockApiResponses.virustotal,
  },
  {
    id: '2',
    service: 'AbuseIPDB',
    target: '8.8.8.8',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: mockApiResponses.abuseipdb,
  },
  {
    id: '3',
    service: 'SecurityTrails',
    target: 'firebase.google.com',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: mockApiResponses.securitytrails,
  },
  {
    id: '4',
    service: 'VirusTotal',
    target: 'evil-site.com',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Failed',
    response: { error: 'API key invalid' },
  },
  {
    id: '5',
    service: 'Shodan',
    target: 'port:22',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: mockApiResponses.shodan,
  },
];
