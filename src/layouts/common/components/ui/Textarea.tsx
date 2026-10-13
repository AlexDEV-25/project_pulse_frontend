import type { TextareaHTMLAttributes } from 'react';

export default function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`form-control ${className}`.trim()} {...props} />;
}
