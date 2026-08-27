import type { IconProps } from '@/components/icons/icon-props';
import { iconSizeProps } from '@/components/icons/icon-props';

export function NotificationIcon({ size = 20, className, ...props }: IconProps) {
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
        d="M8.55664 17.5C8.70293 17.7533 8.91332 17.9637 9.16668 18.11C9.42003 18.2563 9.70743 18.3333 9.99997 18.3333C10.2925 18.3333 10.5799 18.2563 10.8333 18.11C11.0866 17.9637 11.297 17.7533 11.4433 17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.7187 12.771C2.60984 12.8903 2.538 13.0387 2.51191 13.1981C2.48583 13.3575 2.50663 13.5211 2.57179 13.6688C2.63695 13.8166 2.74365 13.9423 2.87891 14.0306C3.01418 14.1188 3.17218 14.1659 3.3337 14.166H16.667C16.8285 14.1661 16.9866 14.1192 17.1219 14.0311C17.2573 13.943 17.3641 13.8175 17.4294 13.6698C17.4948 13.5221 17.5158 13.3586 17.4899 13.1992C17.464 13.0398 17.3924 12.8913 17.2837 12.7718C16.1754 11.6293 15.0004 10.4152 15.0004 6.66602C15.0004 5.33993 14.4736 4.06816 13.5359 3.13048C12.5982 2.1928 11.3265 1.66602 10.0004 1.66602C8.67429 1.66602 7.40252 2.1928 6.46483 3.13048C5.52715 4.06816 5.00037 5.33993 5.00037 6.66602C5.00037 10.4152 3.82453 11.6293 2.7187 12.771Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
