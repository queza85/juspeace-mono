import { cn } from '@/lib/utils';

interface VerifiedBadgeIconProps {
  className?: string;
  size?: number;
}

export function VerifiedBadgeIcon({
  className,
  size = 29,
}: VerifiedBadgeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path
        d="M10.0182 29L7.51364 24.581L2.76818 23.4762L3.22955 18.3667L0 14.5L3.22955 10.6333L2.76818 5.52381L7.51364 4.41905L10.0182 0L14.5 2.00238L18.9818 0L21.4864 4.41905L26.2318 5.52381L25.7705 10.6333L29 14.5L25.7705 18.3667L26.2318 23.4762L21.4864 24.581L18.9818 29L14.5 26.9976L10.0182 29ZM13.1159 19.4024L20.5636 11.6L18.7182 9.59762L13.1159 15.4667L10.2818 12.5667L8.43636 14.5L13.1159 19.4024Z"
        fill="currentColor"
      />
    </svg>
  );
}
