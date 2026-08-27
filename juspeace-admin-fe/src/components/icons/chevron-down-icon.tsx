import type { IconProps } from '@/components/icons/icon-props';
import { iconSizeProps } from '@/components/icons/icon-props';

export function ChevronDownIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...iconSizeProps(size)}
      {...props}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
