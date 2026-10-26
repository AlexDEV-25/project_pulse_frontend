import type { SVGProps } from 'react';

export type IconName =
  | 'search'
  | 'warning'
  | 'trend-up'
  | 'folder'
  | 'user'
  | 'users'
  | 'status'
  | 'calendar'
  | 'coins'
  | 'wallet'
  | 'file'
  | 'download'
  | 'refresh'
  | 'chart'
  | 'target'
  | 'layers'
  | 'bar-chart'
  | 'activity'
  | 'check'
  | 'clock';

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
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm6 10v-2a4 4 0 0 0-3-3.87m-3-4.13a4 4 0 0 0 0-8',
  status: 'M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  calendar: 'M5 4v3m14-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Z',
  coins: 'M7 7c0 1.1 2.24 2 5 2s5-.9 5-2-2.24-2-5-2-5 .9-5 2Zm0 0v4c0 1.1 2.24 2 5 2s5-.9 5-2V7m-10 4v4c0 1.1 2.24 2 5 2s5-.9 5-2v-4',
  wallet: 'M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5v-9ZM4 8h15m-3 4h3v3h-3a1.5 1.5 0 0 1 0-3Z',
  file: 'M6 3h8l4 4v14H6V3Zm8 0v5h4',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3',
  refresh: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8m0 0V3m0 5h5m-5 4a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16m0 0v5m0-5h-5',
  chart: 'M4 19V5M4 19h17M8 15l3-4 3 2 5-7',
  target: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  layers: 'm12 2 10 5-10 5L2 7l10-5Zm0 8 10 5-10 5-10-5 10-5Zm0 8 10 5-10 5-10-5 10-5Z',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  check: 'm5 13 4 4L19 7',
  clock: 'M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
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
