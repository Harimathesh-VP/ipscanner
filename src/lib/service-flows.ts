import { callVirusTotal } from '@/ai/flows/virustotal-flow';
import { callAbuseIPDB } from '@/ai/flows/abuseipdb-flow';
import { callSecurityTrails } from '@/ai/flows/securitytrails-flow';
import { callGreyNoise } from '@/ai/flows/greynoise-flow';
import { callShodan } from '@/ai/flows/shodan-flow';
import { callAlienVault } from '@/ai/flows/alienvault-flow';
import { callIPQualityScore } from '@/ai/flows/ipqualityscore-flow';
import { callCiscoTalos } from '@/ai/flows/ciscotalos-flow';
import { callIBMForce } from '@/ai/flows/ibm-xforce-flow';
import { callGoogleSafeBrowsing } from '@/ai/flows/googlesafebrowsing-flow';
import { callAPIVoid } from '@/ai/flows/apivoid-flow';
import { callWhoisXML } from '@/ai/flows/whoisxml-flow';
import { callSpamhaus } from '@/ai/flows/spamhaus-flow';
import { callNeutrinoAPI } from '@/ai/flows/neutrinoapi-flow';
import { callThreatMiner } from '@/ai/flows/threatminer-flow';
import { callFraudGuard } from '@/ai/flows/fraudguard-flow';
import { callZscaler } from '@/ai/flows/zscaler-flow';
import { callWebroot } from '@/ai/flows/webroot-flow';
import { callRiskIQ } from '@/ai/flows/riskiq-flow';

export const serviceFlows: Record<string, (input: any) => Promise<any>> = {
  virustotal: callVirusTotal,
  abuseipdb: callAbuseIPDB,
  securitytrails: callSecurityTrails,
  greynoise: callGreyNoise,
  shodan: callShodan,
  alienvault: callAlienVault,
  ipqualityscore: callIPQualityScore,
  ciscotalos: callCiscoTalos,
  xforce: callIBMForce,
  googlesafebrowsing: callGoogleSafeBrowsing,
  apivoid: callAPIVoid,
  whoisxml: callWhoisXML,
  spamhaus: callSpamhaus,
  neutrino: callNeutrinoAPI,
  threatminer: callThreatMiner,
  fraudguard: callFraudGuard,
  zscaler: callZscaler,
  webroot: callWebroot,
  riskiq: callRiskIQ,
};
