import type { FC, SVGProps } from 'react';
import { VirusTotalLogo, AbuseIPDBLogo, SecurityTrailsLogo, GreyNoiseLogo, ShodanLogo, AlienVaultLogo } from '@/components/logos';
import type { Service } from './types';

export const services: Service[] = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    icon: VirusTotalLogo,
    description: 'Reputation and analysis of files, domains, IPs, and URLs, with detailed stats.',
    placeholder: 'Enter a domain, IP, or URL',
    inputType: 'resource',
    documentationUrl: 'https://developers.virustotal.com/reference/overview',
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    icon: AbuseIPDBLogo,
    description: 'IP abuse confidence score, report counts, and network context. IP addresses only.',
    placeholder: 'Enter an IP address',
    inputType: 'ipAddress',
    documentationUrl: 'https://docs.abuseipdb.com/',
  },
  {
    id: 'securitytrails',
    name: 'SecurityTrails',
    icon: SecurityTrailsLogo,
    description: 'Primary WHOIS provider with full registrant data, plus DNS and infrastructure intel.',
    placeholder: 'Enter a domain or IP',
    inputType: 'resource',
    documentationUrl: 'https://docs.securitytrails.com/docs',
  },
  {
    id: 'greynoise',
    name: 'GreyNoise',
    icon: GreyNoiseLogo,
    description: 'Internet noise and mass-scan intelligence. Excludes WHOIS. IP addresses only.',
    placeholder: 'Enter an IP address',
    inputType: 'ipAddress',
    documentationUrl: 'https://docs.greynoise.io/',
  },
  {
    id: 'shodan',
    name: 'Shodan',
    icon: ShodanLogo,
    description: 'Search for internet-connected devices, open ports, services, and vulnerabilities.',
    placeholder: 'Enter an IP or search query',
    inputType: 'query',
    documentationUrl: 'https://developer.shodan.io/',
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    icon: AlienVaultLogo,
    description: 'WHOIS data combined with threat pulses, reputation, and passive DNS.',
    placeholder: 'Enter an IP, domain, or hash',
    inputType: 'resource',
    documentationUrl: 'https://otx.alienvault.com/api',
  },
];
