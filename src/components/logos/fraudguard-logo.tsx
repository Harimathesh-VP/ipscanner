import type { FC, SVGProps } from 'react';

export const FraudGuardLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#00b0ff"
    {...props}
  >
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm-1 14l-3-3 1.41-1.41L11 13.17l4.59-4.58L17 10l-6 6z" />
  </svg>
);
