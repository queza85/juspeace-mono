# Serialization architecture — migration plan

**Status:** Planning (not implemented)  
**Last reviewed:** 2026-09-07  
**Scope:** Backend (`juspeace-be`), with follow-on work in admin FE, storefront, and ops tooling.

This document captures the **target serial-first architecture** for JUSPEACE, a **gap analysis against the current codebase**, and a **phased implementation checklist**. Use it as the source of truth when starting serialization work.

Related docs:

- [architecture.md](architecture.md) — current monorepo topology
- [glossary.md](glossary.md) — domain terms (extend when implementing new entities)

---

## 1. Target architecture (summary)

Move from a **temporary, token-based registration model** to a **1-to-1 physical serialization model**:

```text
1 Physical Product = 1 SerializedProduct record = 1 Serial Number = 1 Unique QR Credential
```

### Core principles

| Principle | Description |
| --- | --- |
| **Serial-first** | Every physical item is individually tracked with a server-generated, human-readable serial number. |
| **Permanent product QR** | Each unit has a high-entropy secure QR token (`https://juspeace.com/v/{token}`). The QR **stays ACTIVE forever** — it is **not** consumed at registration. |
| **Decoupled QR status** | Product QRs do not become `USED` after registration. They remain verifiable for the product lifetime. |
| **Four independent lifecycles** | Supply, Sale, Registration, and Certificate are separate status axes — not a single combined product status. |
| **Offline POS** | Staff scan the **product QR** to validate and execute the sale. Dynamic Transaction QRs are removed. |
| **Online fulfillment** | Serial assignment happens at warehouse pack/ship — **not** automatically on payment. |
| **Audit & timeline** | Hard deletes prohibited for serialized inventory. Reallocations, movements, and status changes require an immutable audit trail. |

---

## 2. Target data model

### 2.1 Primary entities (new)

| Entity | Purpose |
| --- | --- |
| `ProductionBatch` | Manufacturing run metadata (batch id, product, quantity produced, created by, timestamps). |
| `SerializedProduct` | One row per physical unit: serial number, FK to batch + catalog product, current location, four status fields. |
| `QRCredential` | High-entropy token (hashed at rest) linked 1:1 to `SerializedProduct`; powers public verification URL. |
| `InventoryAllocation` | *(Redesign existing model)* Per-serial or serial-range assignment to market/distributor — not quantity-only aggregates. |
| `InventoryTransaction` | Append-only log of serial movements (allocate, reallocate, ship, receive, damage, loss). |
| `OrderSerialAssignment` | Links an e-commerce `Order` line item to assigned serial(s) at pack/ship time. |

### 2.2 SerializedProduct location fields

| Field | Notes |
| --- | --- |
| `currentCountryId` | FK to country/market; `NULL` = UNASSIGNED |
| `currentDistributorId` | FK to `AuthorizedSeller` (distributor); `NULL` = UNASSIGNED |

### 2.3 Status enums (independent axes)

**Supply status** — manufacturing / logistics pipeline:

`GENERATED` → `QR_EXPORTED` → `PACKAGED` → `SHIPPED` → `RECEIVED` → (`DAMAGED` | `LOST`)

**Sale status** — commercial availability of the unit:

`AVAILABLE` → (`RESERVED` →) `SOLD` → (`RETURNED` | `VOID`)

**Registration status** — customer ownership claim:

`NOT_REGISTERED` → `REGISTERED` → (`REVOKED`)

**Certificate status** — digital certificate lifecycle:

`NONE` → `ACTIVE` → (`RETURNED` | `REFUNDED` | `REVOKED`)

> **Rule:** Block normal reallocation when `saleStatus != AVAILABLE`.

### 2.4 Audit trail (required fields)

Every reallocation, inventory movement, and status change should append a record with at minimum:

- `beforeData` (JSON snapshot)
- `afterData` (JSON snapshot)
- `reason` (string)
- `userId` (actor)
- `createdAt` (UTC, `TIMESTAMPTZ`)

Prefer soft-delete (`deletedAt`) over hard delete on serialized entities.

---

## 3. Target services & APIs

### 3.1 Serial & QR generator

- Server-side **batch generation** (e.g. 5,000 unique serials + QR tokens in one operation).
- Serial numbers: human-readable, unique, server-generated.
- QR tokens: high-entropy, stored hashed (same pattern as existing `RegistrationTokenService` hashing).

### 3.2 Allocation & reallocation engine

- Bulk reallocation by **serial range**, **CSV upload**, or **production batch**.
- Enforce audit log on every change.
- Reject reallocation when unit `saleStatus != AVAILABLE`.

### 3.3 Verification & scan API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v/{qr-token}` | Public short URL (may be routed outside `/api/v1`). Resolve credential → serial → validation states. |

Example validation states: `VALID_NOT_REGISTERED`, `REGISTERED`, `INVALID`, `REVOKED`, etc.

### 3.4 Registration engine

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/products/{serial}/register` | Customer registers ownership; duplicate registration protection per serial. |

Registration must **not** consume or deactivate the product QR.

### 3.5 POS (offline sales)

| Flow step | Behavior |
| --- | --- |
| 1 | Distributor staff scans product QR (`/v/{token}` or internal scan API). |
| 2 | System validates: serial exists, `saleStatus == AVAILABLE`, assigned to staff's `distributorId`. |
| 3 | Execute sale → set `saleStatus = SOLD`, append audit/timeline. |
| 4 | **No** Transaction QR issued. |

### 3.6 Online sales & fulfillment

| Phase | Behavior |
| --- | --- |
| Payment | Create/update `Order` only — **no** serial assignment, **no** certificate. |
| Pack/ship | Assign serial(s) via `OrderSerialAssignment`; update supply/sale statuses. |
| Registration | Customer registers later via product QR or order lookup → certificate issued. |

### 3.7 QR export pipeline

- Admin operation: generate ZIP containing QR image files + `manifest.csv` (serial, token URL, batch id, etc.).
- Transition supply status to `QR_EXPORTED` for exported units.

### 3.8 Distributor validation

POS actions must verify the scanned serial's `currentDistributorId` matches the authenticated staff member's linked `AuthorizedSeller`.

---

## 4. Current implementation (baseline)

**Module:** `juspeace-be/src/registry/`  
**Schema:** `juspeace-be/prisma/schema.prisma`  
**Baseline migration:** `prisma/migrations/20260831093000_official_purchase_registry/`

### 4.1 What exists today

The current registry is **sale-centric and quantity-based**:

```text
Sale (quantity ≥ 1, tied to catalog Product)
  ├── RegistrationToken  (one-time Transaction QR — offline)
  ├── Registration       (1:1 with Sale)
  └── DigitalCertificate (issued on registration or immediately for online)
```

Supporting models:

- `Market`, `AuthorizedSeller` — distributor/market identity ✅
- `InventoryAllocation` — **quantity** per seller + product (not per serial) ⚠️
- `Order` — e-commerce orders with optional `saleId` FK; **not wired** to fulfillment serial assignment
- `OrderStatusEvent`, `StockMovement` — audit for orders / catalog variants only

### 4.2 Current API surface (registry)

| Method | Path | Role |
| --- | --- | --- |
| `POST` | `/api/v1/sales/quick` | Offline sale + **issues Transaction QR token** |
| `GET` | `/api/v1/sales/:id/registration-token` | Refresh Transaction QR |
| `GET` | `/api/v1/registrations/token/:token/preview` | Preview offline sale by token |
| `POST` | `/api/v1/registrations/token/:token` | Register via token (**consumes token**) |
| `GET` | `/api/v1/registrations/lookup` | Online lookup by order ref + email |
| `POST` | `/api/v1/admin/registry/sales/online` | Online sale + **auto-registration + certificate** |
| `GET` | `/api/v1/certificates/:certificateNo/verify` | Certificate verification (not QR-token verification) |

Key services:

- `SalesService` — `juspeace-be/src/registry/services/sales.service.ts`
- `RegistrationsService` — `juspeace-be/src/registry/services/registrations.service.ts`
- `RegistrationTokenService` — `juspeace-be/src/registry/services/registration-token.service.ts`
- `CertificateNumberService` — `juspeace-be/src/registry/services/certificate-number.service.ts`

### 4.3 Current status enums (for comparison)

| Axis | Current | Target gap |
| --- | --- | --- |
| Supply | *(none)* | Full supply chain enum |
| Sale | `SaleStatus` on `Sale` event (`PENDING`, `COMPLETED`, `VOID`, `REFUNDED`) | Per-unit `AVAILABLE` / `RESERVED` / `SOLD` / … |
| Registration | `RegistrationStatus` on `Sale` (+ extra `WAITING`) | Per-serial; drop sale-level `WAITING` pattern |
| Certificate | `CertificateStatus` (no `NONE`) | Add `NONE`; anchor to serial not sale |

---

## 5. Gap analysis

### 5.1 Summary

| Area | Alignment | Notes |
| --- | --- | --- |
| Distributor / market identity | ~80% | Reuse `AuthorizedSeller`, `Market`, `UserRole.DISTRIBUTOR` |
| Digital certificates | ~40% | Pattern exists; wrong anchor (Sale vs SerializedProduct) |
| Inventory allocation | ~20% | Name exists; wrong granularity (quantity vs serial) |
| Serialization core | 0% | No `ProductionBatch`, `SerializedProduct`, `QRCredential` |
| Product QR verification | 0% | No `/v/{token}` endpoint |
| POS flow | 0% | Uses deprecated Transaction QR flow |
| Online fulfillment bridge | 0% | Orders module does not assign serials at ship |
| QR export | 0% | Not implemented |
| Registry audit trail | 0% | No before/after reallocation logs |
| Soft-delete policy | 0% | CASCADE deletes on registry relations |

### 5.2 Behaviors to deprecate

| Current behavior | Why it conflicts |
| --- | --- |
| `RegistrationToken` as primary offline mechanism | One-time, expiring Transaction QR — replaced by permanent product QR |
| `quickSale` returning `registrationToken` | POS should scan product QR, not issue a new QR |
| `POST /registrations/token/:token` consuming token | Product QR must stay ACTIVE after registration |
| `POST /admin/registry/sales/online` auto-certificate on sale | Certificate/registration deferred until customer action; serial assigned at ship |
| Quantity-based `Sale` as unit of traceability | Cannot track individual physical items |

### 5.3 Reusable patterns (keep / adapt)

| Existing code | Reuse for |
| --- | --- |
| `CertificateNumberService` | Certificate number format (`JPC-{MARKET}-XXXXXXXX`) |
| `RegistrationTokenService` hashing approach | QR token hashing for `QRCredential` |
| `RegistrationsService` validation guards | Duplicate registration, void/refund checks |
| `SalesService` distributor scoping | Extend to serial-level distributor assignment check |
| Throttled public endpoints on `RegistrationsController` | Same pattern for `/v/{token}` and register-by-serial |
| `voidSale` / `refundSale` | Extend to per-serial status transitions + certificate revocation |

---

## 6. Phased implementation checklist

Use this as a sprint/epic breakdown. Do **not** skip schema + audit foundation.

### Phase 0 — Decisions & glossary

- [ ] Confirm serial number format (human-readable spec, uniqueness scope).
- [ ] Confirm QR URL routing (`juspeace.com/v/` — separate router vs API gateway?).
- [ ] Confirm whether `Market` doubles as `currentCountryId` or a separate `Country` entity is needed.
- [ ] Add new terms to [glossary.md](glossary.md) in the same PR as schema changes.

### Phase 1 — Schema foundation

- [ ] Add enums: `SupplyStatus`, `SerializedSaleStatus`, `SerializedRegistrationStatus`, `CertificateStatus` (add `NONE`).
- [ ] Add models: `ProductionBatch`, `SerializedProduct`, `QRCredential`, `InventoryTransaction`, `OrderSerialAssignment`.
- [ ] Redesign `InventoryAllocation` for serial-level assignment (migration strategy for existing quantity rows).
- [ ] Add audit table(s) for reallocations and status changes.
- [ ] Add soft-delete columns where needed; avoid CASCADE on serialized core entities.
- [ ] Prisma migration + seed fixtures for dev/testing.

### Phase 2 — Generation & export

- [ ] `SerialGeneratorService` — batch create serials + QR credentials.
- [ ] Admin API: create production batch, trigger generation.
- [ ] QR export pipeline — ZIP + `manifest.csv`; set `supplyStatus = QR_EXPORTED`.

### Phase 3 — Verification API

- [ ] Public `GET /v/{qr-token}` (or dedicated controller outside global prefix).
- [ ] Response: serial number, product info, four status axes, validation state enum.
- [ ] Rate limiting + no sensitive PII in public responses.

### Phase 4 — Allocation & reallocation

- [ ] Admin APIs: allocate/reallocate by range, CSV, batch.
- [ ] Audit log on every change; block when `saleStatus != AVAILABLE`.
- [ ] Distributor inventory views (serials assigned to seller).

### Phase 5 — POS rewrite (offline)

- [ ] New endpoint: scan product QR → validate → mark serial `SOLD`.
- [ ] Distributor guard: `currentDistributorId` must match staff seller.
- [ ] Deprecate (behind feature flag first): `quickSale` token issuance, `registration-token` endpoint.

### Phase 6 — Online fulfillment bridge

- [ ] On order pack/ship: assign serial(s) via `OrderSerialAssignment`.
- [ ] Wire `Order` fulfillment events in `orders` module to serialization service.
- [ ] Remove auto-registration/certificate from `completeOnlineSale` (or replace with order-ship hook).

### Phase 7 — Registration & certificates (serial-based)

- [ ] `POST /api/v1/products/{serial}/register` — duplicate protection per serial.
- [ ] Certificate issued on registration; anchor `DigitalCertificate` to serial (schema migration from sale-based).
- [ ] Deprecate token-based registration routes after migration window.

### Phase 8 — Frontend & ops

- [ ] Storefront: `/v/{token}` landing + registration UI.
- [ ] Admin: batch management, QR export, serial search, reallocation UI, ship-time serial picker.
- [ ] Distributor app/POS: product QR scan flow.

### Phase 9 — Data migration & cleanup

- [ ] Migration plan for in-flight sales/registrations/tokens (if any production data exists).
- [ ] Remove deprecated models/endpoints: `RegistrationToken`, token registration paths.
- [ ] Update Swagger, integration tests, and [architecture.md](architecture.md).

---

## 7. Verification gates (when implementing)

Per [AGENTS.md](../AGENTS.md), each phase touching backend code must pass:

```bash
cd juspeace-be && pnpm run build && pnpm test && pnpm run lint
```

Additional requirements for this initiative:

- Integration tests for: batch generation uniqueness, reallocation audit, POS distributor guard, duplicate registration, `/v/{token}` states.
- No secrets in QR manifest exports; tokens hashed at rest.
- Glossary updated for every new domain term.

---

## 8. Open questions (resolve before Phase 1)

1. **Serial number format** — Include product code? Batch prefix? Check digit?
2. **Reserved state** — When is `saleStatus = RESERVED` set (online checkout hold vs distributor hold)?
3. **Returns** — Does `RETURNED` reset serial to `AVAILABLE` or a separate quarantine state?
4. **Multi-quantity orders** — One `OrderSerialAssignment` row per serial vs JSON array?
5. **Catalog `Product.stock`** — Coexist with serial counts during transition, or replace entirely for serialized SKUs?
6. **Existing `Sale` model** — Retire, or keep as a sales-event log pointing at `SerializedProduct`(s)?
7. **Public URL hosting** — Does `/v/` live on storefront (Next.js route) or API redirect?

---

## 9. File reference map

| Concern | Path |
| --- | --- |
| Prisma schema | `juspeace-be/prisma/schema.prisma` |
| Registry module | `juspeace-be/src/registry/` |
| Orders module (fulfillment hook) | `juspeace-be/src/orders/` |
| Domain glossary | `docs/glossary.md` |
| Monorepo architecture | `docs/architecture.md` |

---

## 10. Document history

| Date | Change |
| --- | --- |
| 2026-09-07 | Initial gap analysis and migration plan from architecture spec review |
