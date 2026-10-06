-- Storefront Contact us submissions reviewed in the admin console.

CREATE TYPE "ContactInquiryStatus" AS ENUM ('WAITING', 'REPLIED');

CREATE TABLE "contact_inquiries" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "locale" TEXT,
  "status" "ContactInquiryStatus" NOT NULL DEFAULT 'WAITING',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_inquiries_status_createdAt_idx"
  ON "contact_inquiries"("status", "createdAt");
