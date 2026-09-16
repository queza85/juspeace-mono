import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export function SectionHeading({
  children,
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        'font-display text-[clamp(2.25rem,5.5vw,7.5rem)] font-bold leading-[1.07] tracking-[-0.02em] text-black',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
