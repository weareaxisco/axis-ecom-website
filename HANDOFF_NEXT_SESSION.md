<!-- HANDOFF_NEXT_SESSION.md -->
# Next-session handoff: Production-ready database architecture & UI/UX synchronization

## Copy/paste onboarding prompt

You are continuing work on `C:\Users\abder\Desktop\axis-ecom-website`, repository `weareaxisco/axis-ecom-website`.

The project is a React/Vite luxury jewelry storefront backed by Supabase. Recent development focused on making Admin > Operations > MY ORDERS use one canonical order collection, adopting the Inventory table design (search, pagination, rows-per-page, preview, edit, delete, purge), and debugging cross-session order synchronization.

The latest local commit is:

```text
d1dee08 fix(admin): remove legacy mock seed orders, bind admin directly to OrderContext, and add purge all orders action

Do not push automatically. Do not reset, checkout, clean, or revert unrelated changes. Start by inspecting:
git status --short
git log -5 --oneline

Production launch directive: Database-first single source of truth
CRITICAL NOTICE: Local browser storage (localStorage / BroadcastChannel) was used as a temporary fallback during development when backend queries hit schema or RLS errors. For production shipment, browser local storage cannot serve as the order source of truth because orders placed on a mobile device or separate browser will never reach the Admin Studio.

All state contexts (OrderContext, WishlistContext, CartContext) must prioritize direct, unblocked write/read operations against Supabase tables. Local storage must only serve as an offline or guest fallback.

Current architecture state
1. OrderContext (src/context/OrderContext.jsx)
Canonical order state layer.

Exports orders, createOrder, updateOrder, deleteOrder, clearAllOrders, and placeOrder.

Attempts database persistence first, updating context state and broadcasting updates via orders_updated events.

Provides clearAllOrders() which purges context state, local storage keys (maison_orders, axis-orders), and attempts bulk Supabase deletion.

2. Admin Studio (src/pages/Admin.jsx)
Replaces legacy hardcoded mock orders with direct useOrder() consumption.

Mirrors the Inventory table layout (src/components/AdminProductTable.jsx):

Global search across Order Reference ID (#ORD-XXXX), Customer Name, Phone, Email, and City.

Rows per page selector (5, 10, 20, 50, ALL).

Next/Previous page controls (< PAGE X OF Y >).

Item preview modal (links items directly to /product/:id).

Order edit modal (modifies customer name, phone, address, city, status).

Individual order deletion and bulk PURGE ALL ORDERS with user confirmation.

Subscribes to Supabase Realtime (postgres_changes on orders) and 10-second polling fallback.

3. Checkout & Account (src/pages/Checkout.jsx, src/pages/Account.jsx)
Checkout.jsx captures prefilled user metadata, passes exact order payloads to createOrder(), clears active carts, and renders immutable snapshots on confirmation (Step 3).

Account.jsx filters and displays orders matching the authenticated user's ID or email address in real time.

Known technical risks to resolve before launch
Supabase Schema Mismatches

Inconsistent database column names between legacy migrations and new payloads (e.g., total_dh vs total_amount, customer_name, postal_code, or categories.name).

OrderContext.createOrder() retries with legacy-compatible payloads when insertions fail, but schema errors must be rectified at the database level so backend inserts succeed on the first attempt.

Row-Level Security (RLS) Rules

Ensure orders, appointments, wishlists, and cart_items tables have appropriate INSERT policies enabled for anonymous (guest) and authenticated role keys.

Realtime Event Loop Prevention

Admin.jsx and OrderProvider both monitor real-time updates. Deduplicate incoming records by order.id to prevent duplicate renders or infinite event loops.

Component Location Reference

Inventory table logic is located in src/components/AdminProductTable.jsx (not src/pages/AdminInventory.jsx).

Verification commands
Run commands using npm.cmd in PowerShell on Windows:

npm.cmd run lint
npm.cmd run test
npm.cmd run build
git diff --check


Expected baseline:

Tests: 7 files, 16 tests passing.

Build: succeeds with an existing Vite chunk-size warning.

Working tree: clean.

Definition of done for launch
Database queries execute without 400 Bad Request or schema missing column errors.

An order placed by a guest or logged-in user on any device/browser appears instantly in Admin Operations without manual page reloads or local-storage workarounds.

Inventory stock decrements automatically upon confirmed order placement.

Lint, test, and build scripts complete cleanly.