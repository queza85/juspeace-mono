'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const productFormInputClassName =
  'h-9 w-full rounded-md border border-input bg-white px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50';

export function ProductFormSectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-border/60 bg-card shadow-none',
        className,
      )}
    >
      <div className="border-b border-border/50 px-4 py-3 md:px-5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="space-y-4 px-4 py-4 md:px-5 md:py-5">{children}</div>
    </section>
  );
}

export function ProductFormField({
  label,
  required = false,
  optionalLabel,
  htmlFor,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optionalLabel?: string;
  htmlFor?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-foreground">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
        {optionalLabel ? (
          <span className="font-normal text-muted-foreground"> ({optionalLabel})</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProductFormIconInput({
  id,
  icon,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  'aria-invalid': ariaInvalid,
}: {
  id: string;
  icon: ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(productFormInputClassName, 'pl-9')}
      />
    </div>
  );
}

export function ProductFormIconSelect({
  id,
  icon,
  value,
  onChange,
  onBlur,
  placeholder,
  children,
  'aria-invalid': ariaInvalid,
}: {
  id: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  children: ReactNode;
  'aria-invalid'?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={ariaInvalid}
        className={cn(
          productFormInputClassName,
          'appearance-none pr-9 pl-9',
          !value && 'text-muted-foreground',
        )}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
