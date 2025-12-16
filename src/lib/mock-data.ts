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
        reputation: -25,
        whois: 'Registrar: Google LLC...',
      },
    },
  },
  abuseipdb: {
    data: {
      ipAddress: '8.8.8.8',
      isPublic: true,
      abuseConfidenceScore: 0,
      countryCode: 'US',
      usageType: 'Data Center/Web Hosting/Transit',
      isp: 'Google LLC',
      domain: 'google.com',
      totalReports: 12,
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
