import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'outline-success'
    | 'outline-secondary'
    | 'link';
  block?: boolean;
};

export default function Button({
  variant = 'primary',
  block = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}${block ? ' w-100' : ''} ${className}`.trim()}
      {...props}
    />
  );
}
