
## 5.2 Filtering and sorting

- All, High Jewelry, Rings, Bracelets, and Timepieces filters return correct results.
  - [ ] Passed
  - [ ] Not passed

- Filters can be changed repeatedly without stale results.
  - [ ] Passed
  - [ ] Not passed

- Sorting Featured, low-to-high, and high-to-low works correctly.
  - [ ] Passed
  - [ ] Not passed

- Collection filter drawers open and close on desktop.
  - [ ] Passed
  - [ ] Not passed

- Collection filter drawers open and close on mobile.
  - [ ] Passed
  - [ ] Not passed

- Applying a drawer selection updates only the intended collection.
  - [ ] Passed
  - [ ] Not passed

- Reset filters returns catalog to its initial state.
  - [ ] Passed
  - [ ] Not passed

- URL filter/sort state can be copied and reopened correctly.
  - [ ] Passed
  - [ ] Not passed

- Empty results show a translated empty state and reset action.
  - [ ] Passed
  - [ ] Not passed

- Catalog error state is understandable and does not look like success.
  - [ ] Passed
  - [ ] Not passed

- Filter controls are keyboard accessible.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Catalog data, filter logic, sorting, galleries, and responsive cards are accurate.  
**Observed:**  
**Severity:**  
**Product/filter values and reproduction steps:**  
**What should be changed:**  

</details>

---

# 6. Product detail page and product interactions

- A valid product route loads the correct product.
  - [ ] Passed
  - [ ] Not passed

- An invalid product route shows a useful not-found state.
  - [ ] Passed
  - [ ] Not passed

- The main product image and gallery load.
  - [ ] Passed
  - [ ] Not passed

- Desktop hover zoom works without moving page content.
  - [ ] Passed
  - [ ] Not passed

- Mobile tap/gesture image viewing works.
  - [ ] Passed
  - [ ] Not passed

- Lightbox opens, closes, and supports next/previous controls.
  - [ ] Passed
  - [ ] Not passed

- Escape closes the lightbox/modal.
  - [ ] Passed
  - [ ] Not passed

- Metal variants update image, price, and selected state.
  - [ ] Passed
  - [ ] Not passed

- Invalid/unavailable variant selection is prevented or explained.
  - [ ] Passed
  - [ ] Not passed

- Ring-size guide opens and closes.
  - [ ] Passed
  - [ ] Not passed

- Ring-size conversion produces correct values.
  - [ ] Passed
  - [ ] Not passed

- Accordions open and close independently.
  - [ ] Passed
  - [ ] Not passed

- Reviews show only approved review content.
  - [ ] Passed
  - [ ] Not passed

- Review empty and loading states are clear.
  - [ ] Passed
  - [ ] Not passed

- Bespoke enquiry modal opens with the correct product.
  - [ ] Passed
  - [ ] Not passed

- Enquiry validation catches missing/invalid fields.
  - [ ] Passed
  - [ ] Not passed

- Successful enquiry submission shows a confirmation.
  - [ ] Passed
  - [ ] Not passed

- Concierge, WhatsApp, and appointment CTAs go to the correct action.
  - [ ] Passed
  - [ ] Not passed

- Onsite-only pickup messaging is accurate.
  - [ ] Passed
  - [ ] Not passed

- Recommendations are relevant, clickable, and do not duplicate incorrectly.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** PDP content and every interaction works on desktop and mobile.  
**Observed:**  
**Severity:**  
**Product ID/name, viewport, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 7. Search, wishlist, bag, and cart persistence

## 7.1 Search

- Search opens from desktop navigation.
  - [ ] Passed
  - [ ] Not passed

- Search opens from mobile navigation.
  - [ ] Passed
  - [ ] Not passed

- Typing a query returns relevant products/pages.
  - [ ] Passed
  - [ ] Not passed

- Empty search results are translated and helpful.
  - [ ] Passed
  - [ ] Not passed

- Clearing search resets results.
  - [ ] Passed
  - [ ] Not passed

- Pressing Escape closes search.
  - [ ] Passed
  - [ ] Not passed

- Search is usable with keyboard and screen reader labels.
  - [ ] Passed
  - [ ] Not passed

## 7.2 Wishlist

- Adding a product to wishlist updates the icon immediately.
  - [ ] Passed
  - [ ] Not passed

- Removing a product updates the icon immediately.
  - [ ] Passed
  - [ ] Not passed

- Wishlist persists after refresh for a guest.
  - [ ] Passed
  - [ ] Not passed

- Wishlist drawer opens on desktop.
  - [ ] Passed
  - [ ] Not passed

- Wishlist drawer opens on mobile without stacking over the bag incorrectly.
  - [ ] Passed
  - [ ] Not passed

- Wishlist product links open the correct PDP.
  - [ ] Passed
  - [ ] Not passed

- Wishlist item can be moved to bag.
  - [ ] Passed
  - [ ] Not passed

- Signed-in wishlist synchronizes with Supabase.
  - [ ] Passed
  - [ ] Not passed

- Sign-in/sign-out does not unexpectedly lose or duplicate wishlist items.
  - [ ] Passed
  - [ ] Not passed

## 7.3 Bag

- Adding a product opens or updates the bag as intended.
  - [ ] Passed
  - [ ] Not passed

- Bag count is correct in desktop and mobile headers.
  - [ ] Passed
  - [ ] Not passed

- Bag drawer opens and closes from all entry points.
  - [ ] Passed
  - [ ] Not passed

- Overlay and close button have accessible labels.
  - [ ] Passed
  - [ ] Not passed

- Quantity decrement stops at the intended minimum.
  - [ ] Passed
  - [ ] Not passed

- Quantity increment updates line totals and subtotal.
  - [ ] Passed
  - [ ] Not passed

- Removing an item updates count, subtotal, and empty state.
  - [ ] Passed
  - [ ] Not passed

- Bag persists after refresh according to intended behavior.
  - [ ] Passed
  - [ ] Not passed

- Onsite-only products show private boutique pickup messaging.
  - [ ] Passed
  - [ ] Not passed

- Normal products show delivery messaging.
  - [ ] Passed
  - [ ] Not passed

- Proceed-to-checkout is disabled for an empty bag.
  - [ ] Passed
  - [ ] Not passed

- Continue shopping closes the drawer without losing items.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Search, wishlist, bag, persistence, and drawer stacking work without data loss.  
**Observed:**  
**Severity:**  
**Product/query/cart contents and reproduction steps:**  
**What should be changed:**  

</details>

---

# 8. Authentication, registration, and account security

## 8.1 Registration

- Registration page loads in English and French.
  - [ ] Passed
  - [ ] Not passed

- Title, first name, last name, email, country, phone, and password fields work.
  - [ ] Passed
  - [ ] Not passed

- Invalid email is rejected with translated feedback.
  - [ ] Passed
  - [ ] Not passed

- Weak password is rejected with translated feedback.
  - [ ] Passed
  - [ ] Not passed

- Invalid Moroccan phone formats are rejected.
  - [ ] Passed
  - [ ] Not passed

- Valid Moroccan phone formats are accepted.
  - [ ] Passed
  - [ ] Not passed

- CNDP consent is required before submission.
  - [ ] Passed
  - [ ] Not passed

- Duplicate email is handled without exposing sensitive details.
  - [ ] Passed
  - [ ] Not passed

- Successful registration displays verification instructions.
  - [ ] Passed
  - [ ] Not passed

- Resend verification sends an email or reports a clear provider error.
  - [ ] Passed
  - [ ] Not passed

- Registration form is usable on mobile without keyboard obstruction.
  - [ ] Passed
  - [ ] Not passed

## 8.2 Login and session

- Valid credentials log in successfully.
  - [ ] Passed
  - [ ] Not passed

- Invalid credentials show a useful error.
  - [ ] Passed
  - [ ] Not passed

- Unconfirmed account exposes the resend verification action.
  - [ ] Passed
  - [ ] Not passed

- Password visibility toggle works and is labeled.
  - [ ] Passed
  - [ ] Not passed

- Login drawer and login page behave consistently.
  - [ ] Passed
  - [ ] Not passed

- Close buttons and Escape close the login drawer/modal.
  - [ ] Passed
  - [ ] Not passed

- Session persists after refresh.
  - [ ] Passed
  - [ ] Not passed

- Sign out clears protected customer data from the UI.
  - [ ] Passed
  - [ ] Not passed

- Logged-out users are redirected from protected account routes.
  - [ ] Passed
  - [ ] Not passed

- Logged-out users cannot access admin content by guessing URLs.
  - [ ] Passed
  - [ ] Not passed

## 8.3 Account

- Account profile displays the signed-in customer.
  - [ ] Passed
  - [ ] Not passed

- Address can be created, edited, selected, and deleted.
  - [ ] Passed
  - [ ] Not passed

- Invalid address fields are validated.
  - [ ] Passed
  - [ ] Not passed

- Order history loads only the current customer’s orders.
  - [ ] Passed
  - [ ] Not passed

- Order tracker displays correct status and totals.
  - [ ] Passed
  - [ ] Not passed

- Invoice/tax receipt download works and contains correct DH totals.
  - [ ] Passed
  - [ ] Not passed

- CNDP export request can be submitted.
  - [ ] Passed
  - [ ] Not passed

- CNDP erasure request requires the intended confirmation.
  - [ ] Passed
  - [ ] Not passed

- Feedback modal opens with account context and submits correctly.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Authentication, authorization, validation, privacy, and account data are correct and isolated.  
**Observed:**  
**Severity:**  
**Test account type, route, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 9. Checkout, delivery, payments, and orders

## 9.1 Checkout form

- Checkout redirects to login when authentication is required.
  - [ ] Passed
  - [ ] Not passed

- Checkout loads with a valid bag.
  - [ ] Passed
  - [ ] Not passed

- Customer can select a saved address.
  - [ ] Passed
  - [ ] Not passed

- Customer can enter a new delivery address.
  - [ ] Passed
  - [ ] Not passed

- Required checkout fields validate correctly.
  - [ ] Passed
  - [ ] Not passed

- City selection updates delivery pricing.
  - [ ] Passed
  - [ ] Not passed

- Ameex city pricing is shown accurately.
  - [ ] Passed
  - [ ] Not passed

- Onsite-only products force boutique pickup and block incompatible delivery.
  - [ ] Passed
  - [ ] Not passed

- Mixed onsite/delivery cart behavior follows the intended business rule.
  - [ ] Passed
  - [ ] Not passed

- Order summary matches bag line items and quantities.
  - [ ] Passed
  - [ ] Not passed

- Subtotal, delivery fee, tax, and total use correct currency and rounding.
  - [ ] Passed
  - [ ] Not passed

## 9.2 Payment and order creation

- Cash-on-delivery selection works.
  - [ ] Passed
  - [ ] Not passed

- Unavailable payment options are disabled or explained.
  - [ ] Passed
  - [ ] Not passed

- Submitting once does not create duplicate orders.
  - [ ] Passed
  - [ ] Not passed

- Submitting with a network failure shows a retry-safe error.
  - [ ] Passed
  - [ ] Not passed

- Successful order displays confirmation and order reference.
  - [ ] Passed
  - [ ] Not passed

- Successful order appears in the customer account.
  - [ ] Passed
  - [ ] Not passed

- Cart clears only after confirmed order creation.
  - [ ] Passed
  - [ ] Not passed

- Checkout start and purchase analytics fire only once per intended event.
  - [ ] Passed
  - [ ] Not passed

- Receipt/invoice download includes customer/order/tax/Ameex data.
  - [ ] Passed
  - [ ] Not passed

- Mobile checkout fields, sticky totals, and submit controls remain usable.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** A customer can complete one accurate order, or receive a clear recoverable error without duplicate charges/orders.  
**Observed:**  
**Severity:**  
**Order reference, cart, city, payment method, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 10. Concierge, appointments, and calendar synchronization

- Concierge page loads in both languages.
  - [ ] Passed
  - [ ] Not passed

- Boutique/location selector works.
  - [ ] Passed
  - [ ] Not passed

- Appointment date picker blocks invalid/past dates.
  - [ ] Passed
  - [ ] Not passed

- Available time slots load and display correctly.
  - [ ] Passed
  - [ ] Not passed

- Guest count validation works.
  - [ ] Passed
  - [ ] Not passed

- Consultation focus selection works.
  - [ ] Passed
  - [ ] Not passed

- Unauthenticated appointment flow requests sign-in as intended.
  - [ ] Passed
  - [ ] Not passed

- Authenticated customer can submit an appointment.
  - [ ] Passed
  - [ ] Not passed

- Duplicate appointment submission is prevented.
  - [ ] Passed
  - [ ] Not passed

- Appointment confirmation is visible to the customer.
  - [ ] Passed
  - [ ] Not passed

- Admin sees the appointment with correct customer/date/time.
  - [ ] Passed
  - [ ] Not passed

- Admin can confirm an appointment.
  - [ ] Passed
  - [ ] Not passed

- Admin can cancel an appointment.
  - [ ] Passed
  - [ ] Not passed

- Admin can reschedule an appointment.
  - [ ] Passed
  - [ ] Not passed

- Customer-facing status reflects confirmation/cancellation/reschedule.
  - [ ] Passed
  - [ ] Not passed

- Confirmed booking exports a valid `.ics` file.
  - [ ] Passed
  - [ ] Not passed

- Exported event has correct title, date, timezone, duration, and location.
  - [ ] Passed
  - [ ] Not passed

- Configured calendar webhook receives confirmation payload.
  - [ ] Passed
  - [ ] Not passed

- Configured calendar webhook receives reschedule payload.
  - [ ] Passed
  - [ ] Not passed

- Webhook failure is surfaced/logged without falsely reporting success.
  - [ ] Passed
  - [ ] Not passed

- No webhook URL configured does not break appointment confirmation.
  - [ ] Passed
  - [ ] Not passed

- Appointment controls are usable on mobile.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Appointment lifecycle, iCal export, and optional webhook synchronization are reliable.  
**Observed:**  
**Severity:**  
**Booking ID, date/time/timezone, webhook response, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 11. Cookie consent, analytics, and privacy

- First visit displays the cookie banner.
  - [ ] Passed
  - [ ] Not passed

- Strictly necessary category is enabled and disabled control cannot be changed.
  - [ ] Passed
  - [ ] Not passed

- Analytics category can be enabled and disabled.
  - [ ] Passed
  - [ ] Not passed

- Functional category can be enabled and disabled.
  - [ ] Passed
  - [ ] Not passed

- Customize/Personnaliser opens the detailed modal.
  - [ ] Passed
  - [ ] Not passed

- Each category has a clear translated explanation.
  - [ ] Passed
  - [ ] Not passed

- Accept-all persists all optional selections.
  - [ ] Passed
  - [ ] Not passed

- Reject-optional persists only necessary consent.
  - [ ] Passed
  - [ ] Not passed

- Save-custom persists the exact chosen selections.
  - [ ] Passed
  - [ ] Not passed

- Selections are saved under `maison_cookie_preferences`.
  - [ ] Passed
  - [ ] Not passed

- Refreshing restores the saved selections.
  - [ ] Passed
  - [ ] Not passed

- GA4 script does not load before analytics consent.
  - [ ] Passed
  - [ ] Not passed

- GA4 script loads after analytics consent and configured ID.
  - [ ] Passed
  - [ ] Not passed

- Disabling analytics removes/blocks future analytics loading as intended.
  - [ ] Passed
  - [ ] Not passed

- Functional preference controls affect only functional features.
  - [ ] Passed
  - [ ] Not passed

- Necessary authentication/cart/language behavior remains available after rejecting optional cookies.
  - [ ] Passed
  - [ ] Not passed

- Cookie controls are keyboard accessible and readable on mobile.
  - [ ] Passed
  - [ ] Not passed

- Privacy/cookies page matches actual behavior.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Optional tracking never runs without explicit consent, and necessary site behavior remains usable.  
**Observed:**  
**Severity:**  
**Consent choice, localStorage value, network evidence, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 12. Admin authentication, RBAC, and staff security

- Admin login accepts a valid authorized account.
  - [ ] Passed
  - [ ] Not passed

- Admin login rejects invalid credentials.
  - [ ] Passed
  - [ ] Not passed

- A customer account cannot access admin.
  - [ ] Passed
  - [ ] Not passed

- `super_admin` sees all permitted workspaces.
  - [ ] Passed
  - [ ] Not passed

- `admin` sees only intended workspaces.
  - [ ] Passed
  - [ ] Not passed

- `staff_catalog` cannot manage orders or settings.
  - [ ] Passed
  - [ ] Not passed

- `staff_orders` cannot manage products or settings.
  - [ ] Passed
  - [ ] Not passed

- Permission-denied navigation is hidden or blocked.
  - [ ] Passed
  - [ ] Not passed

- Direct URL access to unauthorized admin tabs is blocked.
  - [ ] Passed
  - [ ] Not passed

- Unauthorized mutation requests are rejected by the database/RLS.
  - [ ] Passed
  - [ ] Not passed

- Sign-out removes admin access immediately.
  - [ ] Passed
  - [ ] Not passed

- Admin session refresh does not leak data between accounts.
  - [ ] Passed
  - [ ] Not passed

- Staff creation requires the intended permission.
  - [ ] Passed
  - [ ] Not passed

- Staff role and permission display matches saved data.
  - [ ] Passed
  - [ ] Not passed

- Service-role credentials never reach the browser.
  - [ ] Passed
  - [ ] Not passed

- Admin UI remains usable on mobile/tablet even if desktop-first.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** UI permissions and database enforcement agree; no role can bypass RLS with a direct request.  
**Observed:**  
**Severity:**  
**Role, account, route/API request, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 13. Admin settings and white-label configuration

- Settings page loads only for authorized staff.
  - [ ] Passed
  - [ ] Not passed

- Website name can be edited and saved.
  - [ ] Passed
  - [ ] Not passed

- Logo/brand settings can be edited as implemented.
  - [ ] Passed
  - [ ] Not passed

- Light and dark design tokens can be edited and saved.
  - [ ] Passed
  - [ ] Not passed

- Currency configuration updates storefront prices.
  - [ ] Passed
  - [ ] Not passed

- Contact information updates visible contact surfaces.
  - [ ] Passed
  - [ ] Not passed

- Social links validate allowed URL formats.
  - [ ] Passed
  - [ ] Not passed

- Boutique map URL accepts only the intended secure Google Maps format.
  - [ ] Passed
  - [ ] Not passed

- Invalid map URL is rejected with clear feedback.
  - [ ] Passed
  - [ ] Not passed

- Appointment calendar API/webhook URL can be saved.
  - [ ] Passed
  - [ ] Not passed

- GA4 tracking ID can be saved without loading analytics prematurely.
  - [ ] Passed
  - [ ] Not passed

- Preview reflects unsaved values without accidentally publishing them.
  - [ ] Passed
  - [ ] Not passed

- Save success is visible and persists after refresh.
  - [ ] Passed
  - [ ] Not passed

- Save failure is visible and does not show false success.
  - [ ] Passed
  - [ ] Not passed

- Settings changes are isolated from unrelated configuration.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** White-label settings are validated, persisted, previewable, and reflected consistently.  
**Observed:**  
**Severity:**  
**Setting, old/new value, account role, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 14. Admin catalog and product operations

- Product list loads with correct records and pagination/filters.
  - [ ] Passed
  - [ ] Not passed

- Product creation form opens and closes.
  - [ ] Passed
  - [ ] Not passed

- Required product fields validate.
  - [ ] Passed
  - [ ] Not passed

- Category and collection selectors load database values.
  - [ ] Passed
  - [ ] Not passed

- Taxonomy fallback behaves safely when data is unavailable.
  - [ ] Passed
  - [ ] Not passed

- Price fields save in the canonical model.
  - [ ] Passed
  - [ ] Not passed

- Image URLs validate and display in preview.
  - [ ] Passed
  - [ ] Not passed

- Novelty/new state saves correctly.
  - [ ] Passed
  - [ ] Not passed

- Onsite-only toggle has correct ON/OFF styling.
  - [ ] Passed
  - [ ] Not passed

- Toggling a real UUID product persists to Supabase.
  - [ ] Passed
  - [ ] Not passed

- Toggling a mock product updates local state without UUID error.
  - [ ] Passed
  - [ ] Not passed

- Mock product shows the intended local-update notice.
  - [ ] Passed
  - [ ] Not passed

- Product update failure is shown and does not pretend to save.
  - [ ] Passed
  - [ ] Not passed

- Product deletion requires intended confirmation and removes only the selected product.
  - [ ] Passed
  - [ ] Not passed

- Staff permissions prevent unauthorized catalog mutations.
  - [ ] Passed
  - [ ] Not passed

- Catalog forms remain usable on tablet/mobile widths.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Product CRUD is accurate, permission-aware, and safe for both real and mock records.  
**Observed:**  
**Severity:**  
**Product ID, role, form values, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 15. Admin orders, Ameex, analytics, and feedback

## 15.1 Orders and shipping

- Admin orders list loads correct orders.
  - [ ] Passed
  - [ ] Not passed

- Order details show accurate customer, items, totals, city, and payment method.
  - [ ] Passed
  - [ ] Not passed

- Order status update persists.
  - [ ] Passed
  - [ ] Not passed

- Unauthorized staff cannot update orders.
  - [ ] Passed
  - [ ] Not passed

- Ameex feature flag defaults safely.
  - [ ] Passed
  - [ ] Not passed

- Ameex dispatch is not sent unless explicitly enabled.
  - [ ] Passed
  - [ ] Not passed

- Valid sandbox parcel creation returns and persists a tracking reference.
  - [ ] Passed
  - [ ] Not passed

- Ameex API failure shows a recoverable error.
  - [ ] Passed
  - [ ] Not passed

- Signed webhook rejects invalid signatures.
  - [ ] Passed
  - [ ] Not passed

- Valid webhook updates tracking/status correctly.
  - [ ] Passed
  - [ ] Not passed

- Duplicate webhook delivery is idempotent.
  - [ ] Passed
  - [ ] Not passed

- Customer order tracker reflects the updated status.
  - [ ] Passed
  - [ ] Not passed

## 15.2 Analytics and feedback

- Analytics dashboard is visible only to permitted staff.
  - [ ] Passed
  - [ ] Not passed

- Revenue total matches source orders.
  - [ ] Passed
  - [ ] Not passed

- AOV calculation is correct.
  - [ ] Passed
  - [ ] Not passed

- Order velocity/time range is correct.
  - [ ] Passed
  - [ ] Not passed

- Regional distribution uses correct order locations.
  - [ ] Passed
  - [ ] Not passed

- Activity feed does not expose unnecessary private information.
  - [ ] Passed
  - [ ] Not passed

- Page-view events record intended routes only.
  - [ ] Passed
  - [ ] Not passed

- Checkout-start events are not duplicated on rerenders.
  - [ ] Passed
  - [ ] Not passed

- Purchase events fire only after successful order creation.
  - [ ] Passed
  - [ ] Not passed

- Feedback form validates and saves a submission.
  - [ ] Passed
  - [ ] Not passed

- Feedback failure is visible to the user.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Operations data, shipping integrations, analytics, and feedback are accurate, secure, and failure-aware.  
**Observed:**  
**Severity:**  
**Order/event IDs, role, API response, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 16. Accessibility and interaction quality

- All interactive controls are reachable by keyboard.
  - [ ] Passed
  - [ ] Not passed

- Focus order follows the visual and task order.
  - [ ] Passed
  - [ ] Not passed

- Focus is visible in both themes.
  - [ ] Passed
  - [ ] Not passed

- Enter activates focused buttons/links.
  - [ ] Passed
  - [ ] Not passed

- Escape closes open menus, drawers, and modals where expected.
  - [ ] Passed
  - [ ] Not passed

- Modal/drawer focus does not become trapped behind the overlay.
  - [ ] Passed
  - [ ] Not passed

- Images have appropriate alt text.
  - [ ] Passed
  - [ ] Not passed

- Decorative icons are not announced redundantly.
  - [ ] Passed
  - [ ] Not passed

- Form labels are associated with their controls.
  - [ ] Passed
  - [ ] Not passed

- Validation errors identify the affected field.
  - [ ] Passed
  - [ ] Not passed

- Status/toast messages are understandable without relying on color.
  - [ ] Passed
  - [ ] Not passed

- Text contrast is readable in light and dark themes.
  - [ ] Passed
  - [ ] Not passed

- Controls have adequate touch target size on mobile.
  - [ ] Passed
  - [ ] Not passed

- Reduced-motion preference does not make content unusable.
  - [ ] Passed
  - [ ] Not passed

- Zooming to 200% does not hide essential content.
  - [ ] Passed
  - [ ] Not passed

- A screen reader can identify headings, landmarks, forms, and buttons.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** The site is operable with keyboard, touch, zoom, and assistive technology.  
**Observed:**  
**Severity:**  
**Tool/browser/device and reproduction steps:**  
**What should be changed:**  

</details>

---

# 17. Performance, SEO, and resilience

- Initial page load is acceptable on a throttled mobile connection.
  - [ ] Passed
  - [ ] Not passed

- Images use appropriate dimensions/compression and do not block the page unnecessarily.
  - [ ] Passed
  - [ ] Not passed

- Image skeletons reserve layout space.
  - [ ] Passed
  - [ ] Not passed

- There are no major cumulative layout shifts while images load.
  - [ ] Passed
  - [ ] Not passed

- Route transitions do not leave stale loaders visible.
  - [ ] Passed
  - [ ] Not passed

- A slow Supabase request shows a loading state.
  - [ ] Passed
  - [ ] Not passed

- A failed Supabase request shows an actionable error state.
  - [ ] Passed
  - [ ] Not passed

- Retrying after a transient failure works.
  - [ ] Passed
  - [ ] Not passed

- The page remains usable if optional analytics fails.
  - [ ] Passed
  - [ ] Not passed

- The page remains usable if optional calendar sync fails.
  - [ ] Passed
  - [ ] Not passed

- SEO titles and descriptions are unique for major routes.
  - [ ] Passed
  - [ ] Not passed

- Canonical URLs are correct.
  - [ ] Passed
  - [ ] Not passed

- Policy-only pages have intended indexing/noindex behavior.
  - [ ] Passed
  - [ ] Not passed

- JSON-LD is valid and contains no placeholder values.
  - [ ] Passed
  - [ ] Not passed

- Browser console has no hydration, key, or accessibility errors.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Evidence and failure description</summary>

**Expected:** Slow, failed, or optional services do not create false success or unusable screens.  
**Observed:**  
**Severity:**  
**Performance trace, route, network condition, and reproduction steps:**  
**What should be changed:**  

</details>

---

# 18. Cross-browser and final release matrix

Complete the highest-risk smoke path (home -> catalog -> PDP -> bag -> checkout,
plus login and admin login) in each combination below.

- Desktop Chrome latest.
  - [ ] Passed
  - [ ] Not passed

- Desktop Edge latest.
  - [ ] Passed
  - [ ] Not passed

- Desktop Firefox latest.
  - [ ] Passed
  - [ ] Not passed

- iPhone Safari current.
  - [ ] Passed
  - [ ] Not passed

- Android Chrome current.
  - [ ] Passed
  - [ ] Not passed

- 320 px narrow mobile viewport.
  - [ ] Passed
  - [ ] Not passed

- 390 px mobile viewport.
  - [ ] Passed
  - [ ] Not passed

- 768 px tablet viewport.
  - [ ] Passed
  - [ ] Not passed

- 1440 px desktop viewport.
  - [ ] Passed
  - [ ] Not passed

- English smoke path.
  - [ ] Passed
  - [ ] Not passed

- French smoke path.
  - [ ] Passed
  - [ ] Not passed

- Light-theme smoke path.
  - [ ] Passed
  - [ ] Not passed

- Dark-theme smoke path.
  - [ ] Passed
  - [ ] Not passed

- Clean/incognito consent and authentication path.
  - [ ] Passed
  - [ ] Not passed

- Returning-user persistence path.
  - [ ] Passed
  - [ ] Not passed

<details>
<summary>Final release notes</summary>

**Open blockers:**  
**Open critical/major issues:**  
**Known accepted minor issues:**  
**Screenshots/videos/logs:**  
**Recommended next fix order:**  
**Final decision and date:**  

</details>

## Failed-test handoff format

When returning this file for fixes, preserve each failed checkbox and add a
short record in its details block:

```text
Observed:
Severity:
Environment:
Steps:
Expected:
Actual:
Evidence:
Suggested priority:
```

After a fix is implemented, the developer should verify the original steps,
tick `Passed`, add the fix commit/version, and leave the original failure
description intact for traceability.
