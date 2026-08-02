# API Integration Map

Every endpoint the GearUp API exposes, and the exact frontend code that calls it.

**API base:** `https://ph-b7-assignemnt-4.vercel.app/api/v1`
Paths below are relative to that base. File paths are relative to `src/`.

---

## How a request actually travels

The browser never calls the API directly. Two layers sit in between, and which
one is used depends on where the code runs:

| Layer | File | Used by | What it does |
|---|---|---|---|
| Server fetch | `lib/api.ts` — `serverFetch` / `serverFetchSafe` | Server Components, `generateMetadata` | Adds `Authorization: Bearer <cookie>`, unwraps the `{ success, data, meta }` envelope, throws `ApiError` (or returns `null` for the `Safe` variant) |
| BFF proxy | `app/api/backend/[...path]/route.ts` | Client Components via `lib/client-api.ts` | Re-signs the request with the httpOnly cookie so the JWT never reaches JavaScript |
| Auth routes | `app/api/auth/{login,register,logout}/route.ts` | Login / register forms | The only routes that write or clear the `gearup_token` cookie |

`lib/api-error.ts` normalises every failure into `{ status, message, fieldErrors }`,
which is what feeds inline form errors (`components/forms/form-error.ts`) and
Sonner toasts.

---

## Auth & profile

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| POST | `/auth/register` | `app/api/auth/register/route.ts` ← `app/(auth)/register/register-form.tsx` | Registers, then immediately logs in so the user lands signed in |
| POST | `/auth/login` | `app/api/auth/login/route.ts` ← `app/(auth)/login/login-form.tsx` | Response token is written to the httpOnly cookie; only the safe `user` is returned to the browser |
| GET | `/auth/me` | `lib/session.ts` (`getSession`, React `cache`d), `hooks/use-session.ts` | The authoritative user for every layout |
| POST | `/auth/logout` | `app/api/auth/logout/route.ts` ← `components/layout/user-menu.tsx` | Clears the cookie and the React Query cache |
| GET | `/users/me` | `app/dashboard/profile/page.tsx` | Falls back to the session user if the call fails |
| PATCH | `/users/me` | `app/dashboard/profile/profile-form.tsx` | Sends **only changed fields** — the API rejects an empty body with 400 |

## Categories

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| GET | `/categories` | `app/(public)/page.tsx` (tiles), `app/(public)/gear/page.tsx` (filter), `app/dashboard/provider/gear/{new,[id]/edit}/page.tsx` (form select), `app/dashboard/admin/{categories,gear}/page.tsx` | Public — fetched with `auth: false` |
| POST | `/categories` | `components/admin/category-actions.tsx` | 409 on a duplicate name is bound to the `name` field |
| PATCH | `/categories/:id` | `components/admin/category-actions.tsx` | Same dialog as create |
| DELETE | `/categories/:id` | `components/admin/category-actions.tsx` | 409 ("has gear items") is rewritten as advice |

## Gear (public)

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| GET | `/gear` | `app/(public)/page.tsx` (featured), `app/(public)/gear/page.tsx` (browse + brand options), `app/(public)/gear/[id]/page.tsx` (related), `app/sitemap.ts` | All filters live in the URL; `lib/gear-filters.ts` whitelists them because the API 400s on an unknown `sortBy` |
| GET | `/gear/:id` | `app/(public)/gear/[id]/page.tsx` | `cache()`d so the page body and `generateMetadata` share one call |
| GET | `/gear/:id/reviews` | `app/(public)/gear/[id]/page.tsx`, `lib/reviews.ts` | Also the source for "My reviews" — see the note under Reviews |

## Gear (provider)

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| POST | `/provider/gear` | `components/gear/gear-form.tsx` | |
| GET | `/provider/gear` | `app/dashboard/provider/{page,gear/page,orders/page}.tsx`, `app/dashboard/provider/gear/[id]/edit/page.tsx` | Returns a plain array (no `meta`). The edit page loads from here, so another provider's gear 404s up front |
| PATCH | `/provider/gear/:id` | `components/gear/gear-form.tsx`, `components/gear/gear-row-actions.tsx` | Also powers the availability switch (`{ isAvailable }` alone) |
| DELETE | `/provider/gear/:id` | `components/gear/gear-row-actions.tsx` | 409 ("rental history") is rewritten to suggest hiding instead |

## Rentals (customer)

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| POST | `/rentals` | `components/rental/rent-panel.tsx` | Dates are sent as `yyyy-MM-dd` (`toDateOnly`) so no timezone shifts the day |
| GET | `/rentals` | `app/dashboard/customer/{page,orders/page,reviews/page}.tsx` | No paging or status filter server-side, so KPIs, filters and paging are derived in `lib/orders.ts` |
| GET | `/rentals/:id` | `lib/rentals.ts` (order detail + pay page), `components/payment/payment-status-card.tsx` | The success page polls this until the webhook flips the order to `PAID` |
| PATCH | `/rentals/:id/cancel` | `components/rental/cancel-order-button.tsx` | 409 also triggers `router.refresh()` — the provider moved it on |

## Rentals (provider)

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| GET | `/provider/orders` | `app/dashboard/provider/{orders/page,page}.tsx` | Returns whole orders; the item summary has no `providerId`, so `lib/provider.ts` intersects it with `/provider/gear` to show "your gear" and "your share" |
| PATCH | `/provider/orders/:id` | `components/rental/provider-order-action.tsx` | Buttons come from `providerTransitions` in `constants/status.ts`, mirroring the API's legal map |

## Payments

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| POST | `/payments/create` | `components/payment/pay-panel.tsx` | Upserts one intent per order, so it is safe to run on mount |
| GET | `/payments` | `app/dashboard/customer/payments/page.tsx` | Payment history plus the paid/pending KPIs |
| GET | `/payments/:id` | `app/dashboard/customer/payments/[id]/page.tsx` | Receipt view |
| POST | `/payments/confirm` | **not called by the frontend** | Stripe webhook, server-to-server. It is what sets `PAID`, which is why the success page polls instead of asserting success |

## Reviews

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| POST | `/reviews` | `components/review/review-dialog.tsx` | 409 ("already reviewed") is treated as success — the review exists |

> **No `GET /reviews/me` exists.** "My reviews" is derived: `lib/reviews.ts` takes
> the customer's `RETURNED` orders, then reads each gear item's public review list
> and keeps the entries whose `customerId` matches. That is one request per distinct
> gear item — the honest cost of the API as built, and confined to one function.

## Admin

| Method | Endpoint | Consumed by | Notes |
|---|---|---|---|
| GET | `/admin/users` | `app/dashboard/admin/users/page.tsx`, `app/dashboard/admin/page.tsx` | The overview calls it three times with `limit=1` to read `meta.total` only |
| PATCH | `/admin/users/:id` | `components/admin/user-status-action.tsx` | The admin's own row shows "This is you" with no button — the API 400s on self-target |
| GET | `/admin/gear` | `app/dashboard/admin/gear/page.tsx`, `app/dashboard/admin/page.tsx` | |
| GET | `/admin/rentals` | `app/dashboard/admin/rentals/page.tsx`, `app/dashboard/admin/page.tsx` | Also the revenue figure, summed across `PAID`/`PICKED_UP`/`RETURNED` |
| GET | `/health` | **not called by the frontend** | Uptime probe for the API host |

---

## Coverage

All **25** application endpoints are consumed. The two exceptions are by design:
`POST /payments/confirm` is a Stripe webhook that only Stripe may call, and
`GET /health` is an infrastructure probe.

## Endpoint behaviours the UI is built around

These were read from the API source rather than inferred, and each one shapes a
component:

- `POST /rentals` bills `ceil((endDate − startDate) / 1 day)` and requires
  `endDate > startDate` — **a single-day booking is invalid**, so the date picker
  rejects it before the request.
- Prisma `Decimal` fields (`pricePerDay`, `totalPrice`, `subtotal`, `amount`)
  serialize as **strings**; `money()` and `toNumber()` handle the conversion.
- `payment` on a rental order is a **single nullable object**, not a list.
- The payment intent is created with `allow_redirects: "never"`, so
  `confirmPayment` uses `redirect: "if_required"` and Stripe never redirects.
- An unknown-but-valid gear id returns **404** while a malformed one returns
  **400**, so every 4xx maps to `notFound()`.
- `GET /provider/gear` and `GET /rentals` return plain arrays with **no `meta`**;
  only the `/admin/*` and `GET /gear` endpoints paginate server-side.
