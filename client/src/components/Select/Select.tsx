import { useState, useRef, useEffect } from 'react';
import './Select.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function Select({ value, options, onChange, placeholder, disabled, className, style }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);
  const displayLabel = selected?.label || placeholder || '';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); }
  };

  return (
    <div className={`custom-select ${open ? 'custom-select--open' : ''} ${disabled ? 'custom-select--disabled' : ''} ${className || ''}`} ref={ref} style={style}>
      <button
        type="button"
        className={`custom-select__trigger ${!selected ? 'custom-select__trigger--placeholder' : ''}`}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="custom-select__label">{displayLabel}</span>
        <svg className="custom-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <ul className="custom-select__dropdown" role="listbox">
          {options.map(opt => (
            <li
              key={opt.value}
              className={`custom-select__option ${opt.value === value ? 'custom-select__option--selected' : ''} ${opt.disabled ? 'custom-select__option--disabled' : ''}`}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => !opt.disabled && handleSelect(opt.value)}
            >
              {opt.label}
              {opt.value === value && (
                <svg className="custom-select__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
