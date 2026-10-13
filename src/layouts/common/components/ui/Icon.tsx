import type { SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'warning'
  | 'trend-up'
  | 'folder'
  | 'user'
  | 'status'
  | 'calendar'
  | 'coins'
  | 'wallet'
  | 'file';

type Props = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, string> = {
  search: 'm21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  warning: 'm12 3 9 17H3L12 3Zm0 5v5m0 3h.01',
  'trend-up': 'm4 16 6-6 4 4 6-7M15 7h5v5',
  folder: 'M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2H19.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z',
  user: 'M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  status: 'M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  calendar: 'M5 4v3m14-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z',
  coins: 'M7 7c0 1.1 2.24 2 5 2s5-.9 5-2-2.24-2-5-2-5 .9-5 2Zm0 0v4c0 1.1 2.24 2 5 2s5-.9 5-2V7m-10 4v4c0 1.1 2.24 2 5 2s5-.9 5-2v-4',
  wallet: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9ZM4 8h15m-3 4h3v3h-3a1.5 1.5 0 0 1 0-3Z',
  file: 'M6 3h8l4 4v14H6V3Zm8 0v5h4',
};

export default function Icon({ name, size = 18, className = '', ...props }: Props) {
  return (
    <svg
      aria-hidden="true"
      className={`ui-icon ${className}`.trim()}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
