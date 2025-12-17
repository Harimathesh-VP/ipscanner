import type { FC, SVGProps } from 'react';

export const NeutrinoAPILogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#2b3ea1"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
    <circle cx="12" cy="12" r="5" fill="#fff" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
