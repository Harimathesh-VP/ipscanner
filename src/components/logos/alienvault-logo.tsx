import type { FC, SVGProps } from 'react';

export const AlienVaultLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#52c51a"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
    <path d="M12 8a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2v2a2 2 0 0 1-2 2H8a4 4 0 0 0 4 4 4 4 0 0 0 4-4h-2a2 2 0 0 1-2 2v-2a2 2 0 0 1 2-2h2a4 4 0 0 0-4-4z" />
  </svg>
);
