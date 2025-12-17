import type { FC, SVGProps } from 'react';

export const GoogleSafeBrowsingLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#4285F4"
    {...props}
  >
    <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.06 13.5L7.4 12.06l1.41-1.41L10.94 13.1l4.24-4.24 1.41 1.41L10.94 15.5z" />
  </svg>
);
