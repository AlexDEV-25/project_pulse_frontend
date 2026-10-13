import type { ChangeEvent, KeyboardEvent } from 'react';
import Button from '@/layouts/common/components/ui/Button';
import Icon from '@/layouts/common/components/ui/Icon';
import Select from '@/layouts/common/components/ui/Select';

export type ManagementFilterOption = { value: string; label: string };

export function ManagementSearch({
  value,
  onChange,
  onSearch,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder: string;
  className?: string;
}) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') onSearch?.();
  };
  return (
    <label className={`management-search ${className}`.trim()}>
      <Icon name="search" size={17} />
      <input
        type="text"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
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
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  options: ManagementFilterOption[];
  placeholder: string;
  className?: string;
}) {
  return (
    <Select
      className={`management-select ${className}`.trim()}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

export function ManagementFilterButton({
  onClick,
  className = '',
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="success"
      className={`management-filter-button ${className}`.trim()}
      type="button"
      onClick={onClick}
    >
      Lọc
    </Button>
  );
}
