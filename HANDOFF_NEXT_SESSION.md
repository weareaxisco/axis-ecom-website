# Next-session handoff: Admin order operations and synchronization

## Copy/paste onboarding prompt

You are continuing work on `C:\Users\abder\Desktop\axis-ecom-website`, repository
`weareaxisco/axis-ecom-website`.

The project is a React/Vite luxury jewelry storefront backed by Supabase. The
latest work focused on making Admin > Operations > MY ORDERS use one canonical
order collection, support cross-browser synchronization, and provide order
management actions.

The latest local commit is:

```text
d1dee08 fix(admin): remove legacy mock seed orders, bind admin directly to OrderContext, and add purge all orders action
```

Do not push automatically. Do not reset, checkout, clean, or revert unrelated
changes. Start by inspecting:

```text
git status --short
git log -5 --oneline
```

## Current architecture

### OrderContext

[src/context/OrderContext.jsx](./src/context/OrderContext.jsx) is the canonical
order state and persistence layer.

It currently provides:

- `orders`
- `createOrder`
- `updateOrder`
- `deleteOrder`
- `clearAllOrders`
- `placeOrder` as an alias for `createOrder`

Order loading combines Supabase rows with locally persisted orders. The local
storage keys currently supported are:

- `axis-orders`
- legacy compatibility key `maison_orders`

`createOrder()` normalizes customer identity, totals, items, shipping data,
status, and timestamps; attempts Supabase insertion; updates React state; writes
the current order collection to local storage; and dispatches:

- `orders_updated`
- legacy `order:created`

`updateOrder()` persists changes to Supabase, updates context state, and
dispatches `orders_updated`.

`deleteOrder()` removes one order from Supabase/state/local storage and
dispatches an event.

`clearAllOrders()` attempts a bulk Supabase deletion, clears context state and
both local-storage keys, then dispatches an event with `{ clearAll: true }`.
It intentionally clears the UI/local state even when the remote delete reports
an error, then surfaces that error to the caller.

### Admin

[src/pages/Admin.jsx](./src/pages/Admin.jsx) now:

- Reads `orders` directly from `useOrderContext()`.
- Does not initialize mock orders.
- Filters orders by order reference, raw ID, customer name, phone, email, and
  city.
- Provides rows-per-page controls (`5`, `10`, `20`, `50`, `ALL`).
- Provides previous/next pagination.
- Shows dynamic order counts from the context collection.
- Provides item preview, edit, and delete actions.
- Provides the red `Purge All Orders` action with confirmation text:
  `Wipe all orders permanently?`
- Uses Supabase Realtime INSERT subscription and 10-second polling fallback.
- Feeds fetched/realtime orders into the provider through `orders_updated`.

The item preview links to `/product/:id`. The edit modal updates customer name,
phone, address, city, and status.

### Checkout

[src/pages/Checkout.jsx](./src/pages/Checkout.jsx) calls `createOrder()` with
the checkout snapshot, including customer name/email, items, totals, address,
city, phone, postal code, and payment method. It clears the checkout draft and
cart after submission and displays the immutable order snapshot on confirmation.

## Important current behavior and risks

1. **Supabase schema compatibility**

   The order table has historically used columns such as:

   - `subtotal_dh`
   - `shipping_fee_dh`
   - `total_dh`
   - `delivery_address`
   - `city`
   - `phone`
   - `payment_method`
   - `status`

   A later migration adds `customer_name`, `customer_email`, and `postal_code`.
   `OrderContext.createOrder()` first attempts the normalized payload and retries
   with a legacy-compatible payload if insertion fails. Verify any schema
   changes against `supabase/schema.sql` and migrations before modifying this.

2. **Status format**

   Existing data may contain either `pending_confirmation` or
   `Pending Confirmation`. Preserve compatibility when rendering or updating
   status values.

3. **Realtime duplication**

   `OrderProvider` listens for `orders_updated`, while Admin also receives
   Supabase Realtime/polling results and dispatches those events. Any future
   synchronization work must deduplicate by `order.id` and avoid event loops.

4. **Local storage semantics**

   Local storage is a fallback, not a replacement for Supabase. Do not silently
   discard remote orders when a query returns an empty result or temporarily
   fails. Keep error handling explicit and preserve the existing fallback
   behavior.

5. **Provider fallback**

   `useOrderContext()` has a fallback object for tests/components rendered
   without `OrderProvider`. If adding a context method, update that fallback as
   well.

6. **Repository naming**

   There is no `src/pages/AdminInventory.jsx` in this repository. Inventory table
   behavior is implemented in
   [src/components/AdminProductTable.jsx](./src/components/AdminProductTable.jsx).

## Relevant recent commits

```text
d1dee08  Remove legacy mock orders, bind Admin to OrderContext, add purge action
3d3b928  Add Admin order pagination, preview, edit, and delete capabilities
9c9b057  Add Supabase Realtime subscription and polling fallback
3ce29c5  Add resilient Admin query fallbacks
de6db7b  Centralize order persistence and Admin/Account synchronization
```

## Verification commands

Use `npm.cmd` in PowerShell because Windows execution policy may block
`npm.ps1`:

```text
npm.cmd run lint
npm.cmd run test
npm.cmd run build
git diff --check
```

Expected baseline:

- Tests: 7 files, 16 tests passing.
- Build: succeeds with an existing Vite chunk-size warning.
- Lint: succeeds with existing warnings, including Fast Refresh/effect and
  duplicate locale-key warnings.

## Recommended next-session checks

1. Inspect `git status --short` and confirm no unexpected worktree changes.
2. Read [OrderContext.jsx](./src/context/OrderContext.jsx) and
   [Admin.jsx](./src/pages/Admin.jsx) before modifying synchronization.
3. Verify that a normal checkout order:
   - appears once in Admin without a tab switch,
   - persists after reload,
   - appears in another browser through Realtime or within 10 seconds through
     polling.
4. Verify that editing an order updates both the table and Supabase.
5. Verify that deleting one order removes it from context, local storage, and
   Supabase.
6. Verify that purge confirmation clears the table to `0 orders` and does not
   leave stale rows after polling.
7. Run the existing validation commands before committing.

## Definition of done for the next session

The next session should preserve the canonical OrderContext architecture,
maintain realtime/polling reliability, avoid reintroducing mock orders or
duplicate Admin state, and leave the repository with passing lint/tests/build
checks. Only commit or push when explicitly requested by the user.
