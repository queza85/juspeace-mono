import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VerifiedBadgeIcon } from '@/components/icons/verified-badge-icon';

interface ProductDetailPageIntroProps {
  collectionLabel: string;
  productName: string;
  backAria: string;
  bannerText: string;
}

export function ProductDetailPageIntro({
  collectionLabel,
  productName,
  backAria,
  bannerText,
}: ProductDetailPageIntroProps) {
  return (
    <div className="mb-8 lg:mb-10">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 font-sans text-sm text-black/40">
          <li>
            <Link
              href="/#collection"
              aria-label={backAria}
              className="inline-flex items-center gap-2 transition-colors hover:text-black"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
              <span>{collectionLabel}</span>
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-black/50">{productName}</li>
        </ol>
      </nav>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#EAF6FF] px-4 py-3.5 sm:mt-7 sm:gap-3.5 sm:px-5 sm:py-4">
        <VerifiedBadgeIcon size={30} className="text-[#3897F0]" />
        <p className="font-sans text-sm leading-snug text-black sm:text-[15px]">
          {bannerText}
        </p>
      </div>
    </div>
  );
}
