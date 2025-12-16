import { BrainCircuit, DatabaseZap, Fingerprint, Network, Shield, Wifi } from 'lucide-react';
import type { Service } from './types';

export const services: Service[] = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    icon: Shield,
    description: 'Reputation and analysis of files, domains, IPs, and URLs, with detailed stats.',
    placeholder: 'Enter a domain, IP, or URL',
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    icon: DatabaseZap,
    description: 'IP abuse confidence score, report counts, and network context. IP addresses only.',
    placeholder: 'Enter an IP address',
  },
  {
    id: 'securitytrails',
    name: 'SecurityTrails',
    icon: Network,
    description: 'Primary WHOIS provider with full registrant data, plus DNS and infrastructure intel.',
    placeholder: 'Enter a domain or IP',
  },
  {
    id: 'greynoise',
    name: 'GreyNoise',
    icon: BrainCircuit,
    description: 'Internet noise and mass-scan intelligence. Excludes WHOIS. IP addresses only.',
    placeholder: 'Enter an IP address',
  },
  {
    id: 'shodan',
    name: 'Shodan',
    icon: Wifi,
    description: 'Search for internet-connected devices, open ports, services, and vulnerabilities.',
    placeholder: 'Enter an IP or search query',
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    icon: Fingerprint,
    description: 'WHOIS data combined with threat pulses, reputation, and passive DNS.',
    placeholder: 'Enter an IP, domain, or hash',
  },
];
