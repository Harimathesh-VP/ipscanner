import type { LucideIcon } from 'lucide-react';

export type Service = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  placeholder: string;
};

export type RequestLog = {
  id: string;
  service: string;
  target: string;
  date: string;
  status: 'Success' | 'Failed';
  response: Record<string, any>;
};
