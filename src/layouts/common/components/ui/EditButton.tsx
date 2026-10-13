import type { ButtonHTMLAttributes } from 'react';

export type EditButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function EditButton({
  type = 'button',
  title = 'Chỉnh sửa',
  'aria-label': ariaLabel = 'Chỉnh sửa',
  className = '',
  ...props
}: EditButtonProps) {
  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel}
      className={`action-btn action-btn-edit ${className}`.trim()}
      {...props}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m4 16.5-.8 3.8 3.8-.8L18.5 8a2.1 2.1 0 0 0-3-3L4 16.5Zm10.1-9.1 3 3" />
      </svg>
    </button>
  );
}
