'use client';

import { memo, useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { CloudUpload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

function ProductImageUploadComponent({
  files,
  onChange,
  existingImageUrls = [],
  onExistingImageUrlsChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  existingImageUrls?: string[];
  onExistingImageUrlsChange?: (urls: string[]) => void;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const next = [...files];
      for (const file of Array.from(incoming)) {
        if (!file.type.startsWith('image/')) {
          continue;
        }
        next.push(file);
      }
      onChange(next);
    },
    [files, onChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(files.filter((_, fileIndex) => fileIndex !== index));
    },
    [files, onChange],
  );

  const removeExistingImage = useCallback(
    (index: number) => {
      if (!onExistingImageUrlsChange) {
        return;
      }

      onExistingImageUrlsChange(
        existingImageUrls.filter((_, imageIndex) => imageIndex !== index),
      );
    },
    [existingImageUrls, onExistingImageUrlsChange],
  );

  const hasImages = files.length > 0 || existingImageUrls.length > 0;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/10 px-4 py-8 text-center transition-colors',
          isDragging && 'border-primary/50 bg-primary/5',
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (event.dataTransfer.files.length) {
            addFiles(event.dataTransfer.files);
          }
        }}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-[#e8f4fc]">
          <CloudUpload className="size-7 text-[#5bb5d5]" aria-hidden />
        </div>
        <p className="mt-4 max-w-md text-sm font-semibold text-foreground">
          {t('admin.products.add.image.dropTitle')}
        </p>
        <p className="mt-1 max-w-md text-xs italic text-muted-foreground">
          {t('admin.products.add.image.dropHint')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 h-8 border-border/80 bg-white text-foreground hover:bg-muted/30"
          onClick={() => inputRef.current?.click()}
        >
          {t('admin.products.add.image.browse')}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) {
              addFiles(event.target.files);
              event.target.value = '';
            }
          }}
        />
      </div>

      {hasImages ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {existingImageUrls.map((imageUrl, index) => (
            <li
              key={`${imageUrl}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/20"
            >
              <Image
                src={imageUrl}
                alt=""
                width={240}
                height={180}
                className="aspect-[4/3] w-full object-cover"
              />
              {onExistingImageUrlsChange ? (
                <button
                  type="button"
                  aria-label={t('admin.products.add.image.removeExisting')}
                  className="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeExistingImage(index)}
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              ) : null}
            </li>
          ))}
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted/20"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={240}
                height={180}
                unoptimized
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                aria-label={t('admin.products.add.image.remove', { name: file.name })}
                className="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeFile(index)}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export const ProductImageUpload = memo(ProductImageUploadComponent);
