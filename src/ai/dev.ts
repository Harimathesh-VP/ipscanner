'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/virustotal-flow.ts';
import '@/ai/flows/abuseipdb-flow.ts';
import '@/ai/flows/securitytrails-flow.ts';
import '@/ai/flows/greynoise-flow.ts';
import '@/ai/flows/shodan-flow.ts';
import '@/ai/flows/alienvault-flow.ts';
import '@/ai/flows/report-flow.ts';
