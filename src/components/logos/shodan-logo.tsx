import type { FC, SVGProps } from 'react';

export const ShodanLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="#4242F1"
    {...props}
  >
    <path d="M19.4 3H4.6C3.72 3 3 3.72 3 4.6v14.8C3 20.28 3.72 21 4.6 21h14.8c.88 0 1.6-.72 1.6-1.6V4.6c0-.88-.72-1.6-1.6-1.6zM8.5 18H6v-2.5h2.5V18zm0-5.5H6V10h2.5v2.5zm0-5.5H6V4.5h2.5V7zm11 11h-8.5V16h8.5v2.5zm0-5.5h-8.5V10h8.5v2.5zm0-5.5h-8.5V4.5h8.5V7z"/>
  </svg>
);
