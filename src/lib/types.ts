import type { FC, SVGProps } from 'react';

export type Service = {
  id: string;
  name: string;
  alias?: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  description: string;
  placeholder: string;
  inputType: 'resource' | 'ipAddress' | 'query';
  documentationUrl: string;
  pricing: 'Paid' | 'Free';
  requestLimit: number | null;
};

export type RequestLog = {
  id: string;
  service: string;
  target: string;
  date: string;
  status: 'Success' | 'Failed';
  response: Record<string, any>;
};
