import { BrainCircuit, DatabaseZap, Fingerprint, Network, Shield, Wifi } from 'lucide-react';
import type { Service } from './types';

export const services: Service[] = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    icon: Shield,
    description: 'Analyze suspicious files, domains, IPs and URLs.',
    placeholder: 'Enter a file hash, domain, IP or URL',
  },
  {
    id: 'abuseipdb',
    name: 'AbuseIPDB',
    icon: DatabaseZap,
    description: 'Check IP address reputation and report malicious IPs.',
    placeholder: 'Enter an IP address',
  },
  {
    id: 'securitytrails',
    name: 'SecurityTrails',
    icon: Network,
    description: 'Explore DNS and IP data for any domain.',
    placeholder: 'Enter a domain',
  },
  {
    id: 'greynoise',
    name: 'GreyNoise',
    icon: BrainCircuit,
    description: 'Identify internet noise and mass-scanning activity.',
    placeholder: 'Enter an IP address',
  },
  {
    id: 'shodan',
    name: 'Shodan',
    icon: Wifi,
    description: 'Search for devices connected to the internet.',
    placeholder: 'Enter a search query',
  },
  {
    id: 'alienvault',
    name: 'AlienVault OTX',
    icon: Fingerprint,
    description: 'Investigate threats with Open Threat Exchange.',
    placeholder: 'Enter an IP, domain, or hash',
  },
];
