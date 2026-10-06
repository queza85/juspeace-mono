import Image from 'next/image';
import { cn } from '@/lib/utils';

type VisaLogoProps = {
  alt: string;
  className?: string;
};

export function VisaLogo({ alt, className }: VisaLogoProps) {
  return (
    <span className={cn('relative block h-4 w-10 overflow-hidden', className)}>
      <Image
        src="/payment-method-checkout/visa-logo.png"
        alt={alt}
        width={188}
        height={188}
        className="absolute left-1/2 top-1/2 h-10 w-10 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
      />
    </span>
  );
}
