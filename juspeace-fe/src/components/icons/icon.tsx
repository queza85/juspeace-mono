import { cn } from '@/lib/utils';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function Icon({
  size = 24,
  className,
  children,
  viewBox = '0 0 24 24',
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      {children}
    </svg>
  );
}
