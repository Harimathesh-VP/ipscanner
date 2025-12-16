import type { FC, SVGProps } from 'react';

export const VirusTotalLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width="1em"
    height="1em"
    {...props}
  >
    <g fill="currentColor">
      <path d="M79.8 192.2L0 134.7l21.2-21.2l52.9 52.8l-15.5 25.9z" />
      <path d="m100.3 216.3l21.2 21.2l134.5-134.5l-21.2-21.2z" />
      <path d="M213.5 0L100.3 113.2l42.4 42.4L256 42.4z" />
    </g>
  </svg>
);
