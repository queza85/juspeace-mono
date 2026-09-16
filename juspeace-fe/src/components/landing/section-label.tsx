import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'font-serif text-[20px] leading-normal text-black sm:text-[24px] lg:text-[32px]',
        className,
      )}
    >
      {children}
    </p>
  );
}
