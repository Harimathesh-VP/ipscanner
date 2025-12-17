import type { FC, SVGProps } from 'react';

export const ZscalerLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#ff7f00"
    {...props}
  >
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.45 1.45C20.63 14.91 21 13.5 21 12c0-3.87-3.13-7-7-7v2c2.76 0 5 2.24 5 5zM3 4.27l2.28 2.28C3.63 7.82 2.75 9.77 2.2 12c.55 2.23 1.43 4.18 2.82 5.45l2.28 2.28C5.09 17.5 4 14.94 4 12c0-1.5.37-2.9.99-4.14L3 4.27zM12 7c-2.76 0-5 2.24-5 5 0 .63.13 1.22.35 1.77L14.23 6.65C13.78 6.37 12.92 6 12 6z" />
  </svg>
);
