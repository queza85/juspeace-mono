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

When adding new commerce concepts (order, payment, shipment), extend this table in the same change as the code.
