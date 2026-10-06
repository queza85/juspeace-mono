import Link from 'next/link';

interface CollectionCtaButtonProps {
  href: string;
  label: string;
}

export function CollectionCtaButton({ href, label }: CollectionCtaButtonProps) {
  return (
    <Link
      href={href}
      className="jp-landing-cta mt-5 inline-flex items-center justify-center"
    >
      {label}
    </Link>
  );
}
