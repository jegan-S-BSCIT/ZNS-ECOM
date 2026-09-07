# Zen Nova — Supabase Backend

This app is a Vite + React SPA. It now uses **Supabase** (Postgres + Auth) for
customer accounts, admin login, orders, and the admin dashboard's product/order/
customer data. The Supabase project is `ZNS-ECOM` (`dknudbaqrhaooqlipagf`).

## Setup

1. Copy `.env.example` to `.env` and fill in your project's URL + publishable key
   (already done for this project — see `.env`).
2. `npm install`
3. `npm run dev`

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` belong in the frontend.
**Never** put a secret/service-role key in this app — it's a browser SPA with no
backend, so authorization is enforced entirely by Postgres Row Level Security
(RLS) policies, not by a secret key.

## Schema

All tables live in `public` with RLS enabled. Applied directly to the live
project via migrations `core_schema`, `harden_functions`, `fix_order_children_insert_rls`
(view with `supabase migration list` once you link the CLI, or in the Dashboard's
Database → Migrations tab).

| Table | Purpose |
|---|---|
| `customers` | One row per signed-up user (name, email, phone). Auto-created by a trigger (`handle_new_customer`) on `auth.users` signup. Powers the admin "Customers" tab (user management). |
| `products` | Admin-editable fields only: price, stock, category, benefit line, images. Seeded from the existing static catalog in `src/data/products.js`. The rich marketing content (ingredients, how-to-use, reviews) stays in that static file and is untouched — only admin CRUD operates on the DB copy. |
| `orders` | One row per order/"project". Buyer info (`buyer_name`, `buyer_email`, `buyer_phone`, `is_guest`) and shipping address are snapshotted onto the order itself, so admin sees full buyer info per order even for guest checkouts. |
| `order_items` | Line items per order. |
| `order_status_history` | The 7-stage tracking timeline per order. |

There's intentionally **no `sellers` table** — this is a single-brand store
(Zen Nova), so "seller" is just static store info, not data. There's also no
buyer/"buyer person" split — one `customers` row per person, matching how
login already worked.

## Auth

Real Supabase email/password auth replaces the old fake localStorage login for
**both** customers and admin — same `auth.users` table, same sign-in form. What
distinguishes an admin is `app_metadata.role = 'admin'`, which is **not**
user-editable (unlike `user_metadata`), so it's safe to gate the admin
dashboard on it.

**To make an account an admin:**
1. Sign up normally through `/login` with the admin's real email + password.
2. Run this in the Supabase SQL editor (replace the email):
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
   where email = 'admin@zennova.com';
   ```
3. Sign out and back in (or wait for token refresh) — `/admin` will now show the dashboard instead of the login gate.

There is no `admins` table and no hardcoded admin credentials anywhere in the code.

### Forgot password
Swapped the old fake 4-digit OTP for Supabase's real `resetPasswordForEmail` —
it emails a reset link. (Supabase's email templates use its default sender
until you configure custom SMTP in the dashboard.)

## RLS model

- `products`: public read (anon + authenticated); write requires `is_admin()`.
- `customers`: a user can read/update only their own row; admin reads all.
- `orders` / `order_items` / `order_status_history`: a customer can read only
  their own orders; admin reads/updates all. Insert is allowed for `anon` too
  (guest checkout) as long as `customer_id` is null or matches the caller.
- `is_admin()` reads the caller's own JWT (`auth.jwt() -> app_metadata ->> role`)
  — no bypass, no `SECURITY DEFINER` needed.
- `order_accepts_write(order_id)` is a narrow `SECURITY DEFINER` helper used
  only inside the `order_items`/`order_status_history` insert policies. It's
  needed because `anon` has no SELECT policy on `orders`, so a plain `EXISTS`
  subquery against `orders` would always see zero rows for guest checkout. The
  function only returns a boolean ("does this order accept a write from me"),
  not order data, so it doesn't leak anything even though it's callable
  directly. This was verified against the live project (see Verification).

## Known limitations (accepted for this scope)

- **Guest order tracking is session-only.** A guest's order is held in memory
  after checkout (so `/order-confirmation` and `/order-tracking/:id` work
  immediately), but there's no "look up my order by ID + email" endpoint for a
  guest returning later — only signed-in customers get persisted order
  history. Add an Edge Function or RPC for this if guest order lookup becomes
  a real requirement.
- **Guest checkout inserts are unauthenticated by design** (RLS allows `anon`
  insert with `customer_id is null`), which is inherent to any storefront that
  supports guest checkout without payment verification — not specific to this
  implementation.
- **Product catalog content (ingredients, how-to-use, full review lists)**
  stays in `src/data/products.js`, not the database — only the fields the
  admin dashboard actually edits were moved to Supabase, to avoid turning this
  into a full CMS rebuild that wasn't asked for.
- Cart and wishlist remain in `localStorage` (per-device), unchanged — they
  weren't part of the buyer/admin/auth scope.

## Verification performed

- `npm run build` — passes.
- Headless-Chrome screenshots of `/`, `/shop`, `/login`, `/admin` — all render
  correctly (admin correctly shows the login gate when signed out).
- Exercised the live Supabase REST/Auth API directly (matching exactly what
  `src/lib/db.js` sends): public product read, guest order + items + status
  history insert, signup → `customers` trigger fires, anon cannot read orders,
  a forged `customer_id` insert is rejected, a forged `order_id` on
  `order_items` is rejected. All test rows were cleaned up afterward.
- `supabase db advisors` (security) is clean except two expected/reviewed
  `SECURITY DEFINER` warnings (`order_accepts_write`, explained above, and
  Supabase's own pre-existing `rls_auto_enable` platform function).
- Did **not** click through the UI in a real interactive browser (no
  Playwright/`chromium-cli` available in this environment) — the sign-up,
  checkout, and admin-CRUD *forms* themselves were not exercised end-to-end
  through actual clicks/typing. Recommend a manual pass before shipping.
