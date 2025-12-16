import type { FC, SVGProps } from 'react';

export const IBMXForceLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    width="1em"
    height="1em"
    fill="#0062ff"
    {...props}
  >
    <path d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10z" />
    <path d="M16 10a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
  </svg>
);
