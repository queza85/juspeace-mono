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
| `user.role` | Authorization role | `role` (`USER`, `ADMIN`) | Role |
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

**Datetime rule:** Persist UTC only (`TIMESTAMPTZ`). Convert to the viewer’s timezone (e.g. Korea → `Asia/Seoul`, Myanmar → `Asia/Yangon`) in the UI — never store local wall-clock times in the database. Browser clients send `X-Timezone: Asia/Seoul` (IANA) on every API request so the backend can format or log in the caller’s zone without guessing.

When adding new commerce concepts (order, payment, shipment), extend this table in the same change as the code.
