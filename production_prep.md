---

```markdown
<!-- production_prep.md -->
@workspace Implement production database schema alignment, stock decrementation, full data persistence, and UI polish for launch readiness.

Execute the following checklist step-by-step. Update checkboxes as tasks complete.

---

### Phase 1: Database Schema & Core Order Pipeline (CRITICAL)

- [ ] **Task 1: Supabase `orders` Schema & RLS Alignment (`src/context/OrderContext.jsx`)**
  - Verify and align column mappings in `createOrder()` payload with Supabase `orders` schema: `id`, `user_id`, `customer_name`, `customer_email`, `phone`, `shipping_address`, `city`, `postal_code`, `payment_method`, `items`, `subtotal_dh`, `shipping_fee_dh`, `total_dh`, `status`, `created_at`.
  - Ensure guest (anonymous) and authenticated checkout submissions write directly to Supabase without triggering 400 Bad Request console errors or falling back exclusively to local storage.

- [ ] **Task 2: Real-Time Cross-Device Sync (`src/pages/Admin.jsx`, `src/context/OrderContext.jsx`)**
  - Verify that `Admin.jsx`'s Supabase Realtime subscription (`postgres_changes` on table `orders`) and 10-second polling fallback process incoming records across all browsers and devices.
  - Deduplicate incoming orders by `order.id` before updating context state.

---

### Phase 2: Complete Backend Feature Persistence Checklist

- [ ] **Task 3: Inventory Stock Decrementation (`src/context/OrderContext.jsx`, `src/components/AdminProductTable.jsx`)**
  - Update `createOrder()` to decrease item stock in the Supabase `products` table upon order placement.
  - Prevent checkout if item stock is 0.
  - Automatically refresh inventory counts across `/catalog` and Admin Product Table.

- [ ] **Task 4: Concierge & Appointments Sync (`src/pages/Concierge.jsx`, `src/pages/Admin.jsx`)**
  - Save submitted consultation/appointment forms to a Supabase `appointments` table.
  - Hydrate the **APPOINTMENTS** tab in `Admin.jsx` directly from this backend table.

- [ ] **Task 5: Wishlist & Account Sync (`src/context/WishlistContext.jsx`)**
  - Persist wishlist selections to a Supabase `wishlists` table for authenticated users.
  - Automatically merge guest wishlist items into user accounts upon login.

- [ ] **Task 6: Authenticated Cart Sync (`src/context/CartContext.jsx`)**
  - Save active user shopping carts to a Supabase `cart_items` table so carts follow accounts across devices upon login.

- [ ] **Task 7: Fulfillment Status & Tracking Logs Sync (`src/pages/Admin.jsx`, `src/pages/Account.jsx`)**
  - Ensure status updates in Admin (e.g., updating to "Dispatched via AMEEX" or adding tracking references) update Supabase in real time and reflect on the customer's `/account` Order Tracker.

---

### Phase 3: UI/UX & Responsive Refinement

- [ ] **Task 8: Header User Dropdown & Navigation Bridge (`src/components/Header.jsx`)**
  - Ensure desktop dropdown opens on hover with an invisible bridge to prevent flickering on pointer movement.
  - Show **My Account** / **Logout** when authenticated, and **Sign In** / **Sign Up** when unauthenticated.
  - Preserve the existing mobile drawer functionality unchanged.

- [ ] **Task 9: Desktop Form Focus State Guard (`src/pages/Checkout.jsx`)**
  - Remove native `autoFocus` attributes from desktop inputs to prevent cards from showing gold outline rings on initial page load.
  - Restrict auto-focusing programmatically to mobile viewports (`window.innerWidth < 768`).

---

### Local Verification & Commit ONLY (NO GIT PUSH)
Execute terminal commands upon completing all tasks:
- `npm.cmd run lint`
- `npm.cmd run test`
- `npm.cmd run build`
- `git add . && git commit -m "feat: complete production database alignment, stock decrementation, and launch readiness"`