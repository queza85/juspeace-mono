import { cn } from '@/lib/utils';

interface MediaPlaceholderProps {
  className?: string;
  label?: string;
  aspectRatio?: string;
}

/** Gray media stand-in until real assets are provided. */
export function MediaPlaceholder({
  className,
  label,
  aspectRatio = '4 / 5',
}: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden bg-jp-light-gray text-jp-muted',
        className,
      )}
      style={{ aspectRatio }}
      role="img"
      aria-label={label ?? 'Image placeholder'}
    >
      {label ? (
        <span className="font-mono text-xs uppercase tracking-wide">{label}</span>
      ) : null}
    </div>
  );
}
