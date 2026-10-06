# Juspeace domain glossary

Source of truth for domain terms used in code, API fields, UI labels, and database models.

| Canonical key | Description | API / DB field | UI label (en) |
| --- | --- | --- | --- |
| `product` | Sellable catalog item | `Product` | Product |
| `product.slug` | URL-safe product identifier | `slug` | — |
| `product.priceCents` | Price in minor currency units | `priceCents` | Price |
| `product.stock` | Available inventory count | `stock` | In stock / Out of stock |
| `product.status` | Catalog visibility lifecycle | `status` (`DRAFT`, `ACTIVE`, `ARCHIVED`) | — |
| `category` | Product grouping | `Category` | Category |
| `cart` | Client-side purchase intent collection | — (juspeace-fe Zustand store) | Cart |
| `user` | Authenticated account (storefront or admin) | `User` | Account |
| `user.email` | Unique login identifier | `email` | Email |
| `user.role` | Authorization role | `role` (`USER`, `ADMIN`, `DISTRIBUTOR`) | Role |
| `user.name` | Display name | `name` | Name |
| `user.passwordHash` | Optional bcrypt hash; null for OAuth-only users | `passwordHash` | — |
| `oauthAccount` | Linked identity from an external provider | `OAuthAccount` | — |
| `oauthAccount.provider` | Social identity provider | `provider` (`GOOGLE`) | — |
| `oauthAccount.providerUserId` | Provider subject / user id (e.g. Google `sub`) | `providerUserId` | — |
| `refreshToken` | Opaque rotatable session token (hashed at rest) | `RefreshToken` | — |
| `passwordResetCode` | Single-use 6-digit OTP for password recovery (hashed at rest) | `PasswordResetCode` | Verification Code |
| `passwordResetSession` | Short-lived opaque token after OTP verify (hashed at rest) | `PasswordResetSession` | — |
| `twoFactorEnabled` | Whether email OTP 2FA is required after password login (not enforced until wired) | `User.twoFactorEnabled` | — |
| `twoFactorChallenge` | Pending 2FA login context after password check (hashed challenge token) | `TwoFactorChallenge` | — |
| `twoFactorCode` | Single-use 6-digit OTP for login 2FA (hashed at rest) | `TwoFactorCode` | Verification Code |
| `datetime.utc` | All persisted timestamps (`createdAt`, `updatedAt`, `expiresAt`, …) | `DateTime` `@db.Timestamptz(3)` (UTC) | Local time via client formatter |
| `api.message` | Endpoint-specific SCREAMING_SNAKE_CASE response code | `message` (`LOGIN_SUCCESSFULLY`, `PRODUCT_CREATED_SUCCESSFULLY`, …) | Toast via `apiMessages.*` i18n |
| `market` | Country / regional market for official sales | `Market` | Market |
| `market.code` | Market code used in certificate numbers (e.g. `MX`) | `code` | — |
| `authorizedSeller` | Official online store, distributor, or retail partner | `AuthorizedSeller` | Authorized Seller |
| `sale` | Official purchase event (online or offline) | `Sale` | Sale |
| `sale.registrationStatus` | Customer registration lifecycle on a sale | `registrationStatus` | Registration Status |
| `registration` | Customer claim linking a sale to email/account | `Registration` | Registration |
| `registrationToken` | One-time offline Transaction QR token (hashed at rest) | `RegistrationToken` | — |
| `digitalCertificate` | Official JUSPEACE purchase certificate record | `DigitalCertificate` | Official JUSPEACE Digital Certificate |
| `digitalCertificate.certificateNo` | Public certificate identifier (e.g. `JPC-MX-XXXXXXXX`) | `certificateNo` | Certificate No. |
| `inventoryAllocation` | Seller-scoped allocated inventory for reporting | `InventoryAllocation` | Allocated Inventory |
| `productVariant` | SKU-level sellable unit with stock counters | `ProductVariant` | Variation |
| `productVariant.sku` | Unique stock-keeping unit | `sku` | SKU |
| `stockMovement` | Append-only inventory audit entry | `StockMovement` | Stock History |
| `order` | E-commerce purchase (separate from registry `Sale`) | `Order` | Order |
| `order.orderNumber` | Public order identifier (e.g. `ORD-00001`) | `orderNumber` | Order Number |
| `orderLineItem` | Snapshot line on an order | `OrderLineItem` | — |
| `orderStatusEvent` | Fulfillment status change audit | `OrderStatusEvent` | Status History |
| `contentBlock` | Storefront section copy or media the admin publishes | `ContentBlock` | Content |
| `contentBlock.section` | Which storefront area the block fills | `section` (`HERO`, `BRAND_STORY`, `FEATURES`, `VERIFICATION`, `DONATION`, `VIDEO`, `FAQ`, `GALLERY`, `ABOVE_FAQ`, `NAV_LINK`, `FOOTER_LINK`, `POLICY`) | Section |
| `siteSetting` | Named storefront setting (logo, contact, policy links) | `SiteSetting` | Settings |
| `shippingMethod` | Delivery option and fee shown at checkout | `ShippingMethod` | Shipping |
| `shippingMethod.priceCents` | Shipping fee in minor currency units | `priceCents` | Shipping fee |
| `paymentMethodConfig` | Checkout payment option. Provider stays `DUMMY` until a PG is connected; no credentials are stored | `PaymentMethodConfig` | Payment method |
| `paymentMethodConfig.provider` | Payment processor slot | `provider` (`DUMMY`) | Provider |
| `promotion` | Discount code | `Promotion` | Promotion |
| `promotion.discountValue` | Percent (1–100) or fixed minor units, depending on `discountType` | `discountValue` | Discount |
| `productReview` | Product rating moderated in admin | `ProductReview` | Review |
| `newsletterSubscriber` | Email captured for the storefront newsletter | `NewsletterSubscriber` | Newsletter |
| `featuredProduct` | Product chosen for the storefront collection, with optional card image | `FeaturedProduct` | Featured |
| `storedFile` | Image kept in Azure Blob Storage. The database stores the relative blob path, not the storage account URL | `images/{uuid}.{ext}` | Image |
| `storedFile.fileName` | Blob path passed to the file proxy | query `fileName` on `GET /files` | — |

**Datetime rule:** Persist UTC only (`TIMESTAMPTZ`). Convert to the viewer’s timezone (e.g. Korea → `Asia/Seoul`, Myanmar → `Asia/Yangon`) in the UI — never store local wall-clock times in the database. Browser clients send `X-Timezone: Asia/Seoul` (IANA) on every API request so the backend can format or log in the caller’s zone without guessing.

When adding new commerce concepts (order, payment, shipment), extend this table in the same change as the code.
