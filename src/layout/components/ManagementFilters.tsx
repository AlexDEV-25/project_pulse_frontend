import type { ChangeEvent, KeyboardEvent } from 'react';

export type ManagementFilterOption = { value: string; label: string };

export function ManagementSearch({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onSubmit?.();
  };
  return (
    <label className="management-search">
      <span aria-hidden="true">⌕</span>
      <input
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </label>
  );
}

export function ManagementSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ManagementFilterOption[];
  placeholder: string;
}) {
  return (
    <select className="management-select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

export function ManagementFilterButton({ onClick }: { onClick: () => void }) {
  return <button className="management-filter-button" type="button" onClick={onClick}>Lọc</button>;
}
