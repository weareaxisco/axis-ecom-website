@workspace Implement full database persistence for Wishlist, Appointments, Stock Decrementation, Authenticated Cart, and Tracking Logs.

Execute the following task list step-by-step. Update checkboxes as completed.

---

### Phase 1: Database Persistence Checklist

- [ ] **Task 1: Wishlist & Saved Creations Sync (`src/context/WishlistContext.jsx`)**
  - Connect wishlist operations directly to the Supabase `wishlists` table for authenticated users.
  - Automatically load saved items upon login and merge local guest items into the DB record.
  - Fall back to `localStorage` seamlessly when unauthenticated.

- [ ] **Task 2: Concierge & Private Appointments (`src/pages/Concierge.jsx`, `src/pages/Admin.jsx`)**
  - Save submitted consultation/appointment requests into a Supabase `appointments` table.
  - Hydrate the **APPOINTMENTS** tab in `Admin.jsx` directly from this table.
  - Add real-time event broadcasting (`appointments_updated`) so new bookings pop up in Admin instantly.

- [ ] **Task 3: Inventory Stock Decrementation (`src/context/OrderContext.jsx`, `src/pages/Admin.jsx`)**
  - Modify `createOrder()` in `OrderContext.jsx` to trigger a stock deduction query on Supabase `products` for each purchased item.
  - Prevent orders if item stock equals 0.
  - Refresh product listings across `/catalog` and Admin inventory when stock changes.

- [ ] **Task 4: Authenticated Shopping Cart Sync (`src/context/CartContext.jsx`)**
  - Persist active cart items to a `cart_items` table in Supabase when a user is logged in.
  - Ensure cart state follows the account across devices and browsers upon login.

- [ ] **Task 5: Fulfillment & Tracking Logs Sync (`src/pages/Admin.jsx`, `src/pages/Account.jsx`)**
  - Ensure status changes made in Admin (e.g., updating to "Dispatched via AMEEX" or adding tracking codes) update the order record in Supabase.
  - Sync status changes in real-time to the customer's `/account` Order Tracker.

---

### Local Verification & Commit ONLY (NO GIT PUSH)
Execute terminal commands upon completing all tasks:
- `npm run lint`
- `npm run test`
- `npm run build`
- `git add . && git commit -m "feat: complete database persistence for wishlist, appointments, stock, cart, and tracking"`