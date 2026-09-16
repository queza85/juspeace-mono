-- CreateEnum
CREATE TYPE "SaleChannel" AS ENUM ('OFFICIAL_ONLINE', 'RETAIL', 'DISTRIBUTOR', 'POPUP', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PENDING', 'COMPLETED', 'VOID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('NOT_REGISTERED', 'WAITING', 'REGISTERED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('ACTIVE', 'RETURNED', 'REFUNDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'ONLINE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('OFFICIAL_ONLINE', 'DISTRIBUTOR', 'RETAIL', 'POPUP', 'EVENT');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DISTRIBUTOR';

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorized_sellers" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SellerType" NOT NULL,
    "locationLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "authorized_sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_allocations" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "authorizedSellerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "allocatedQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "inventory_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "authorizedSellerId" TEXT NOT NULL,
    "channel" "SaleChannel" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'PENDING',
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'NOT_REGISTERED',
    "soldAt" TIMESTAMPTZ(3),
    "soldByUserId" TEXT,
    "orderReference" TEXT,
    "voidedAt" TIMESTAMPTZ(3),
    "refundedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "registeredAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_tokens" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "consumedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_certificates" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "status" "CertificateStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productName" TEXT NOT NULL,
    "collectionName" TEXT,
    "marketCode" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "purchaseChannel" "SaleChannel" NOT NULL,
    "registrationDate" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "digital_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "markets_code_key" ON "markets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "authorized_sellers_userId_key" ON "authorized_sellers"("userId");

-- CreateIndex
CREATE INDEX "authorized_sellers_marketId_idx" ON "authorized_sellers"("marketId");

-- CreateIndex
CREATE INDEX "authorized_sellers_isActive_idx" ON "authorized_sellers"("isActive");

-- CreateIndex
CREATE INDEX "inventory_allocations_marketId_idx" ON "inventory_allocations"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_allocations_authorizedSellerId_productId_key" ON "inventory_allocations"("authorizedSellerId", "productId");

-- CreateIndex
CREATE INDEX "sales_status_idx" ON "sales"("status");

-- CreateIndex
CREATE INDEX "sales_registrationStatus_idx" ON "sales"("registrationStatus");

-- CreateIndex
CREATE INDEX "sales_authorizedSellerId_idx" ON "sales"("authorizedSellerId");

-- CreateIndex
CREATE INDEX "sales_orderReference_idx" ON "sales"("orderReference");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_saleId_key" ON "registrations"("saleId");

-- CreateIndex
CREATE INDEX "registrations_customerEmail_idx" ON "registrations"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "registration_tokens_tokenHash_key" ON "registration_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "registration_tokens_saleId_consumedAt_expiresAt_idx" ON "registration_tokens"("saleId", "consumedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "digital_certificates_registrationId_key" ON "digital_certificates"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "digital_certificates_certificateNo_key" ON "digital_certificates"("certificateNo");

-- CreateIndex
CREATE INDEX "digital_certificates_status_idx" ON "digital_certificates"("status");

-- AddForeignKey
ALTER TABLE "authorized_sellers" ADD CONSTRAINT "authorized_sellers_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorized_sellers" ADD CONSTRAINT "authorized_sellers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_allocations" ADD CONSTRAINT "inventory_allocations_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_allocations" ADD CONSTRAINT "inventory_allocations_authorizedSellerId_fkey" FOREIGN KEY ("authorizedSellerId") REFERENCES "authorized_sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_allocations" ADD CONSTRAINT "inventory_allocations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_authorizedSellerId_fkey" FOREIGN KEY ("authorizedSellerId") REFERENCES "authorized_sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_soldByUserId_fkey" FOREIGN KEY ("soldByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_tokens" ADD CONSTRAINT "registration_tokens_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_certificates" ADD CONSTRAINT "digital_certificates_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
