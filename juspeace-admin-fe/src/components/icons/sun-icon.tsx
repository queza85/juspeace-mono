import type { IconProps } from '@/components/icons/icon-props';
import { iconSizeProps } from '@/components/icons/icon-props';

export function SunIcon({ size = 20, className, ...props }: IconProps) {
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
        d="M10 13.3333C11.841 13.3333 13.3333 11.841 13.3333 10C13.3333 8.15905 11.841 6.66667 10 6.66667C8.15905 6.66667 6.66667 8.15905 6.66667 10C6.66667 11.841 8.15905 13.3333 10 13.3333Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 1.66667V3.33333M10 16.6667V18.3333M18.3333 10H16.6667M3.33333 10H1.66667M15.7733 4.22667L14.5833 5.41667M5.41667 14.5833L4.22667 15.7733M15.7733 15.7733L14.5833 14.5833M5.41667 5.41667L4.22667 4.22667"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
