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
    <path d="M12.01 2.01C6.5 2.01 2.01 6.5 2.01 12.01c0 5.51 4.49 9.99 9.99 9.99s10-4.48 10-9.99c0-5.51-4.49-9.99-9.99-9.99zM12 19c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-3-7c0-1.66 1.34-3 3-3v2c-1.1 0-2 .9-2 2H9zm3 5c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z" />
  </svg>
);
