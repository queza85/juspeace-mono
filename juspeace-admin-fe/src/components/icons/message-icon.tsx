import type { IconProps } from '@/components/icons/icon-props';
import { iconSizeProps } from '@/components/icons/icon-props';

export function MessageIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...iconSizeProps(size)}
      {...props}
    >
      <path
        d="M16.6667 3.33398H6.66667C5.74619 3.33398 5 4.08018 5 5.00065V12.5007C5 13.4211 5.74619 14.1673 6.66667 14.1673H16.6667C17.5871 14.1673 18.3333 13.4211 18.3333 12.5007V5.00065C18.3333 4.08018 17.5871 3.33398 16.6667 3.33398Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3333 5.83398L12.4167 8.98398C11.9417 9.23398 11.3917 9.23398 10.9167 8.98398L5 5.83398"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.66699 6.66602V15.8327C1.66699 16.7493 2.41699 17.4993 3.33366 17.4993H15.0003"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
