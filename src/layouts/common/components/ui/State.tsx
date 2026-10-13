import type { ReactNode } from 'react';

export default function State({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`${error ? 'alert alert-danger' : 'text-secondary'} py-3`.trim()}
      role={error ? 'alert' : undefined}
    >
      {children}
    </div>
  );
}
