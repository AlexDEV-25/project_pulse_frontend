import type { ButtonHTMLAttributes } from 'react';

export type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function DeleteButton({
  type = 'button',
  title = 'Xóa',
  'aria-label': ariaLabel = 'Xóa',
  className = '',
  ...props
}: DeleteButtonProps) {
  return (
    <button
      type={type}
      title={title}
      aria-label={ariaLabel}
      className={`action-btn action-btn-delete ${className}`.trim()}
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
        <path d="M5 7h14m-9 4v6m4-6v6M9 7V4h6v3m-9 0 1 13h10l1-13" />
      </svg>
    </button>
  );
}
