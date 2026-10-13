import type { ReactNode } from 'react';

export default function Table({
  children,
  className = '',
  wrapperClassName = '',
}: {
  children: ReactNode;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={`table-responsive ${wrapperClassName}`.trim()}>
      <table className={`table align-middle mb-0 ${className}`.trim()}>
        {children}
      </table>
    </div>
  );
}
