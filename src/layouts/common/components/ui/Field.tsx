import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
};

export default function Field({
  label,
  htmlFor,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={`mb-3 ${className}`.trim()}>
      <label className="form-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
