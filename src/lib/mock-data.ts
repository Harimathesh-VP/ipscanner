import type { RequestLog } from './types';

// Keeping mockApiResponses for history page for now.
// API responses are now fetched live.
export const mockApiResponses: Record<string, any> = {};

export const mockRequestLogs = (): RequestLog[] => [
  {
    id: '1',
    service: 'VirusTotal',
    target: 'google.com',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: { "message": "This is a mock log entry." },
  },
  {
    id: '2',
    service: 'AbuseIPDB',
    target: '8.8.8.8',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: { "message": "This is a mock log entry." },
  },
  {
    id: '3',
    service: 'SecurityTrails',
    target: 'firebase.google.com',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'Success',
    response: { "message": "This is a mock log entry." },
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
    response: { "message": "This is a mock log entry." },
  },
];
