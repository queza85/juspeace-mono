import { cn } from '@/lib/utils';

interface BracketLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function BracketLabel({ children, className }: BracketLabelProps) {
  return (
    <p
      className={cn(
        'font-mono text-[14px] leading-normal text-black sm:text-[16px] lg:text-[18px]',
        className,
      )}
    >
      [ {children} ]
    </p>
  );
}
