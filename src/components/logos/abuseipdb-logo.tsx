import type { FC, SVGProps } from 'react';

export const AbuseIPDBLogo: FC<SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
    >
        <g fill="none" strokeWidth="1.5">
            <path 
                stroke="#000" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M16.596 10.316C17.728 10.7 19 11.058 19 12.167c0 1.25-2 2.465-4.5 2.465S10 13.416 10 12.167c0-1.042.821-1.614 2.128-2.03M12.128 10.136A2.5 2.5 0 0 0 10 12.167M19 12.167v3.166c0 1.25-2 2.465-4.5 2.465S10 16.582 10 15.333v-3.166"
            />
            <path fill="#fff" stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M10 15.333V12.5s0-1 .5-1.5h8c.5.5.5 1.5.5 1.5v2.833" />
            <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M11.5 8.136a2.5 2.5 0 0 1 3-3 2.5 2.5 0 0 1 2.5 3" />
            <circle cx="12" cy="12" r="10" stroke="#d32f2f" strokeWidth="2"/>
            <path d="M4.22 4.22l15.56 15.56" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round"/>
        </g>
    </svg>
);
