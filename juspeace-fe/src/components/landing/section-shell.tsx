import { cn } from '@/lib/utils';

interface SectionShellProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function SectionShell({
  id,
  className,
  children,
  fullWidth = false,
}: SectionShellProps) {
  return (
    <section id={id} className={cn('relative w-full scroll-mt-24', className)}>
      {fullWidth ? (
        children
      ) : (
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-6 lg:px-[75px] xl:px-[120px]">
          {children}
        </div>
      )}
    </section>
  );
}
