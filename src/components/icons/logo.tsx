import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="currentColor">
        <path d="M72 48a24 24 0 0 1-24 24h-8a24 24 0 0 1-24-24a24 24 0 0 1 24-24h8a24 24 0 0 1 24 24Z" opacity={0.6} />
        <path d="M136 120a24 24 0 0 1-24 24h-8a24 24 0 0 1-24-24a24 24 0 0 1 24-24h8a24 24 0 0 1 24 24Z" opacity={0.8} />
        <path d="M200 192a24 24 0 0 1-24 24h-8a24 24 0 0 1-24-24a24 24 0 0 1 24-24h8a24 24 0 0 1 24 24Z" />
        <path fill="hsl(var(--accent))" d="m202.83 83.17l-64 64a8 8 0 0 1-11.32 0l-32-32a8 8 0 0 1 11.32-11.32L132 98.34l58.34-58.34a8 8 0 0 1 11.32 11.32l-1.17 1.17Z" />
      </g>
    </svg>
  );
}
