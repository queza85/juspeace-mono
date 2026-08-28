'use client';

import { memo, useCallback, useRef } from 'react';
import {
  Bold,
  Code,
  Image as ImageIcon,
  Italic,
  Link2,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { productFormInputClassName } from '@/components/products/product-form-primitives';
import { cn } from '@/lib/utils';

type ToolbarAction = {
  label: string;
  icon: typeof Bold;
  wrap?: [string, string];
};

const toolbarActions: ToolbarAction[] = [
  { label: 'Bold', icon: Bold, wrap: ['**', '**'] },
  { label: 'Italic', icon: Italic, wrap: ['*', '*'] },
  { label: 'Underline', icon: Underline, wrap: ['<u>', '</u>'] },
  { label: 'Strikethrough', icon: Strikethrough, wrap: ['~~', '~~'] },
  { label: 'Code', icon: Code, wrap: ['`', '`'] },
  { label: 'Link', icon: Link2, wrap: ['[', '](url)'] },
  { label: 'Image', icon: ImageIcon, wrap: ['![alt](', ')'] },
];

function ProductDescriptionEditorComponent({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  'aria-invalid': ariaInvalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  'aria-invalid'?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyWrap = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.slice(start, end);
      const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
      onChange(nextValue);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = start + before.length + selected.length;
        textarea.setSelectionRange(cursor, cursor);
      });
    },
    [onChange, value],
  );

  return (
    <div className="overflow-hidden rounded-md border border-input bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/20 px-2 py-1.5">
        {toolbarActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => {
                if (action.wrap) {
                  applyWrap(action.wrap[0], action.wrap[1]);
                }
              }}
            >
              <Icon className="size-3.5" aria-hidden />
            </button>
          );
        })}
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        rows={8}
        className={cn(
          productFormInputClassName,
          'min-h-[180px] resize-y rounded-none border-0 bg-transparent px-3 py-3 focus-visible:ring-0',
        )}
      />
    </div>
  );
}

export const ProductDescriptionEditor = memo(ProductDescriptionEditorComponent);
