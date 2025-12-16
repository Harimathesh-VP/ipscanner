import type { FC, SVGProps } from 'react';

export const GreyNoiseLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#9FA3A8"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path
      d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
      fill="#FFF"
    />
    <path d="M12 12a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
  </svg>
);
