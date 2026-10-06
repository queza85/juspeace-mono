-- Storefront configuration managed from the admin console.
-- Payment rows stay on the DUMMY provider until a PG integration is added.

CREATE TYPE "ContentSection" AS ENUM (
  'HERO',
  'BRAND_STORY',
  'FEATURES',
  'VERIFICATION',
  'DONATION',
  'VIDEO',
  'FAQ',
  'GALLERY',
  'ABOVE_FAQ',
  'NAV_LINK',
  'FOOTER_LINK',
  'POLICY'
);

CREATE TYPE "PaymentProviderKind" AS ENUM ('DUMMY');

CREATE TABLE "content_blocks" (
  "id" TEXT NOT NULL,
  "section" "ContentSection" NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "body" TEXT,
  "imageUrl" TEXT,
  "href" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_blocks_section_locale_published_sortOrder_idx"
  ON "content_blocks"("section", "locale", "published", "sortOrder");

CREATE TABLE "site_settings" (
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL DEFAULT '',
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "shipping_methods" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "priceCents" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "estimatedDays" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipping_methods_code_key" ON "shipping_methods"("code");
CREATE INDEX "shipping_methods_enabled_sortOrder_idx" ON "shipping_methods"("enabled", "sortOrder");

CREATE TABLE "payment_method_configs" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "provider" "PaymentProviderKind" NOT NULL DEFAULT 'DUMMY',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "instructions" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "payment_method_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_method_configs_code_key" ON "payment_method_configs"("code");
CREATE INDEX "payment_method_configs_enabled_sortOrder_idx" ON "payment_method_configs"("enabled", "sortOrder");

CREATE TABLE "promotions" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "discountType" "DiscountType" NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "startsAt" TIMESTAMPTZ(3),
  "endsAt" TIMESTAMPTZ(3),
  "usageLimit" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");
CREATE INDEX "promotions_active_idx" ON "promotions"("active");

CREATE TABLE "product_reviews" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "title" TEXT,
  "body" TEXT NOT NULL,
  "reviewerName" TEXT NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_reviews_productId_published_idx" ON "product_reviews"("productId", "published");

ALTER TABLE "product_reviews"
  ADD CONSTRAINT "product_reviews_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "newsletter_subscribers" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "locale" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

CREATE TABLE "featured_products" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "cardImageUrl" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "featured_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "featured_products_productId_key" ON "featured_products"("productId");
CREATE INDEX "featured_products_sortOrder_idx" ON "featured_products"("sortOrder");

ALTER TABLE "featured_products"
  ADD CONSTRAINT "featured_products_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
