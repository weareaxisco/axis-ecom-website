# Maison Luxury E-commerce QA Acceptance Checklist

This is the manual release checklist for the developer/owner. It converts the
implemented roadmap in `PROJECT_PLAN.md` into reproducible acceptance tests.
Run every test on both a desktop viewport and a mobile viewport unless the
section says otherwise.

## How to use this file

For each question, tick exactly one result:

- [ ] Passed
- [ ] Not passed

Then open the matching `Details` block and replace the prompt with evidence,
the URL/route, browser/device, test data, and what should happen versus what
actually happened. Do not delete failed tests. When a fix is released, change
the result to `Passed` and retain the original failure description below it.

Recommended test environments:

- Desktop: Chrome or Edge, 1440 x 900, keyboard and mouse.
- Mobile: Chrome device emulation at 390 x 844 and a real iOS/Android device.
- Also test a narrow tablet width around 768 px.
- Test in English and French, in light and dark theme where available.
- Use a clean/incognito browser for consent, authentication, cart, and
  persistence tests.
- Never record real customer passwords, payment data, or private personal data
  in this file.

## Test record

- Tester:
- Date:
- Commit/version:
- Desktop browser and OS:
- Mobile browser and OS:
- Supabase environment:
- Ameex environment:
- Overall release decision: [ ] Ready [ ] Blocked

<details>
<summary>Environment notes</summary>

Replace this text with browser versions, device models, test accounts, seeded
data, feature flags, and any setup needed to reproduce the results.

</details>

## Result legend and severity

Use the following severity in each failure description:

- **Blocker:** checkout, authentication, data loss, security, or a broken route.
- **Critical:** a major customer/admin workflow is unusable or incorrect.
- **Major:** a prominent feature is broken but a workaround exists.
- **Minor:** visual, copy, accessibility, or low-impact behavior defect.

---

# 1. Automated and deployment gates

## 1.1 Local verification

- [ ] Passed  [ ] Not passed — `npm.cmd run test` completes successfully with no failed tests.
- [ ] Passed  [ ] Not passed — `npm.cmd run test:e2e` completes successfully with no failed tests.
- [ ] Passed  [ ] Not passed — `npm.cmd run lint` completes without errors; warnings are reviewed and accepted.
- [ ] Passed  [ ] Not passed — `npm.cmd run build` completes successfully.
- [ ] Passed  [ ] Not passed — the production build serves successfully from a clean process.
- [ ] Passed  [ ] Not passed — the browser console has no new uncaught errors on the critical routes.
- [ ] Passed  [ ] Not passed — the network tab has no unexpected 4xx/5xx requests during the smoke test.
- [ ] Passed  [ ] Not passed — no secrets, service-role keys, or private credentials are present in the client bundle.
- [ ] Passed  [ ] Not passed — database migrations are applied to the intended Supabase environment.
- [ ] Passed  [ ] Not passed — RLS policies are enabled for all customer and admin tables.

<details>
<summary>Evidence and failure description</summary>

**Expected:** All automated gates pass and no release-blocking console/network issue exists.  
**Observed:**  
**Severity:**  
**Command, URL, log, or screenshot:**  
**What should be changed:**  

</details>

## 1.2 Routing and refresh smoke test

- [ ] Passed  [ ] Not passed — `/` loads directly without a blank screen.
- [ ] Passed  [ ] Not passed — every public footer destination loads directly.
- [ ] Passed  [ ] Not passed — `/login`, `/register`, `/account`, `/checkout`, and `/concierge` load or redirect correctly.
- [ ] Passed  [ ] Not passed — `/admin` is protected and does not expose admin content to a logged-out visitor.
- [ ] Passed  [ ] Not passed — refreshing every tested route preserves the route and does not produce a server 404.
- [ ] Passed  [ ] Not passed — browser back and forward navigation preserve usable state.
- [ ] Passed  [ ] Not passed — an unknown route displays the intended fallback rather than a broken application.

<details>
<summary>Evidence and failure description</summary>

**Expected:** Direct navigation, refresh, history navigation, and unknown-route handling are reliable.  
**Observed:**  
**Severity:**  
**Routes and reproduction steps:**  
**What should be changed:**  

</details>

---

# 2. Global shell, brand, theme, and responsive behavior

## 2.1 Desktop shell

- [ ] Passed  [ ] Not passed — the header logo/maison name is visible and aligned.
- [ ] Passed  [ ] Not passed — desktop navigation links use the correct routes.
- [ ] Passed  [ ] Not passed — search, account, wishlist, bag, language, and theme controls are visible where expected.
- [ ] Passed  [ ] Not passed — each icon has an accessible name or adjacent accessible text.
- [ ] Passed  [ ] Not passed — hover states are subtle, consistent, and do not cause layout shifts.
- [ ] Passed  [ ] Not passed — sticky header behavior does not cover content or collection headings.
- [ ] Passed  [ ] Not passed — the footer is complete, aligned, and has no placeholder links.
- [ ] Passed  [ ] Not passed — the global loader shows the configured maison name during hydration/loading.
- [ ] Passed  [ ] Not passed — there is no horizontal scrollbar at 1440 px.
- [ ] Passed  [ ] Not passed — focus indicators remain visible when navigating with Tab.

## 2.2 Mobile shell

- [ ] Passed  [ ] Not passed — the mobile header fits within 390 px with no clipping.
- [ ] Passed  [ ] Not passed — the menu opens and closes reliably.
- [ ] Passed  [ ] Not passed — the menu overlay traps focus or otherwise remains keyboard accessible.
- [ ] Passed  [ ] Not passed — tapping outside the mobile menu closes it when intended.
- [ ] Passed  [ ] Not passed — mobile navigation links close the menu after navigation.
- [ ] Passed  [ ] Not passed — mobile footer accordions open independently.
- [ ] Passed  [ ] Not passed — mobile touch targets are large enough and do not overlap.
- [ ] Passed  [ ] Not passed — no page has horizontal scrolling at 320, 360, or 390 px.
- [ ] Passed  [ ] Not passed — sticky elements do not obscure buttons, headings, or form fields.
- [ ] Passed  [ ] Not passed — mobile orientation change preserves usable layout.

## 2.3 Theme and brand configuration

- [ ] Passed  [ ] Not passed — light/bright theme applies the configured background, text, border, and gold tokens.
- [ ] Passed  [ ] Not passed — dark theme applies the configured tokens without unreadable contrast.
- [ ] Passed  [ ] Not passed — theme preference persists after refresh.
- [ ] Passed  [ ] Not passed — changing the website/maison name updates the loader and visible brand locations.
- [ ] Passed  [ ] Not passed — configured currency symbol is reflected consistently.
- [ ] Passed  [ ] Not passed — invalid or missing site configuration has a safe, visible fallback.
- [ ] Passed  [ ] Not passed — admin preview matches the storefront after saving valid configuration.

<details>
<summary>Evidence and failure description</summary>

**Expected:** The same brand system is coherent and responsive on desktop, tablet, and mobile.  
**Observed:**  
**Severity:**  
**Viewport/device and route:**  
**What should be changed:**  

</details>

---

# 3. Localization and language persistence

- [ ] Passed  [ ] Not passed — switching from English to French updates the current page immediately.
- [ ] Passed  [ ] Not passed — switching from French to English updates the current page immediately.
- [ ] Passed  [ ] Not passed — the selected language persists after refresh.
- [ ] Passed  [ ] Not passed — the selected language persists after closing and reopening the browser.
- [ ] Passed  [ ] Not passed — navigation keeps the selected language.
- [ ] Passed  [ ] Not passed — header, footer, drawers, forms, modals, empty states, and errors are translated.
- [ ] Passed  [ ] Not passed — login, registration, verification, and password-related validation are translated.
- [ ] Passed  [ ] Not passed — checkout labels, delivery text, payment text, and validation are translated.
- [ ] Passed  [ ] Not passed — account, wishlist, orders, privacy, export, and deletion controls are translated.
- [ ] Passed  [ ] Not passed — admin navigation, settings, appointments, products, orders, staff, and analytics are translated.
- [ ] Passed  [ ] Not passed — no accidental translation keys such as `missing.key` appear to users.
- [ ] Passed  [ ] Not passed — product names, database categories, statuses, and customer data are not incorrectly translated.
- [ ] Passed  [ ] Not passed — translated text does not overflow or clip on mobile.
- [ ] Passed  [ ] Not passed — French accents and apostrophes render correctly.

<details>
<summary>Evidence and failure description</summary>

**Expected:** Every user-facing static string supports instant FR/EN switching; data values remain data-driven.  
**Observed:**  
**Severity:**  
**Language, route, and exact untranslated text:**  
**What should be changed:**  

</details>

---

# 4. Home page, editorial content, and discoverability

## 4.1 Home page

- [ ] Passed  [ ] Not passed — hero imagery loads with no broken image icon.
- [ ] Passed  [ ] Not passed — hero text remains readable over imagery in both themes.
- [ ] Passed  [ ] Not passed — primary hero CTA navigates to the correct destination.
- [ ] Passed  [ ] Not passed — collection/story carousel controls work with mouse, keyboard, and touch.
- [ ] Passed  [ ] Not passed — carousel images do not cause cumulative layout shift.
- [ ] Passed  [ ] Not passed — all homepage CTAs have meaningful labels and destinations.
- [ ] Passed  [ ] Not passed — desktop and mobile image crops preserve the subject.
- [ ] Passed  [ ] Not passed — lazy-loaded content appears as intended without blank permanent areas.
- [ ] Passed  [ ] Not passed — SEO title, description, canonical URL, and JSON-LD are correct.

## 4.2 Footer destinations

- [ ] Passed  [ ] Not passed — Careers opens the correct page.
- [ ] Passed  [ ] Not passed — Boutique opens the correct page.
- [ ] Passed  [ ] Not passed — Story and craftsmanship pages load.
- [ ] Passed  [ ] Not passed — care guide and delivery/returns pages load.
- [ ] Passed  [ ] Not passed — privacy, terms, cookies, and modern slavery pages load.
- [ ] Passed  [ ] Not passed — Instagram link opens the configured URL.
- [ ] Passed  [ ] Not passed — TikTok link opens the configured URL.
- [ ] Passed  [ ] Not passed — WhatsApp link opens the configured phone/URL.
- [ ] Passed  [ ] Not passed — no International strip or obsolete placeholder remains.

<details>
<summary>Evidence and failure description</summary>

**Expected:** Editorial content, SEO metadata, and footer destinations are complete and credible.  
**Observed:**  
**Severity:**  
**Route, link, device, and screenshot:**  
**What should be changed:**  

</details>

---

# 5. Catalog, filters, sorting, and product cards

## 5.1 Catalog rendering

- [ ] Passed  [ ] Not passed — catalog loading skeletons appear briefly and disappear.
- [ ] Passed  [ ] Not passed — live Supabase products render with correct names, images, categories, prices, and badges.
- [ ] Passed  [ ] Not passed — fallback/mock products render when the catalog is unavailable.
- [ ] Passed  [ ] Not passed — mock products do not trigger invalid UUID database errors.
- [ ] Passed  [ ] Not passed — product cards have consistent dimensions on desktop.
- [ ] Passed  [ ] Not passed — product cards stack cleanly on mobile.
- [ ] Passed  [ ] Not passed — broken product images use the intended fallback.
- [ ] Passed  [ ] Not passed — image alt text is meaningful and decorative images are hidden from assistive technology.
- [ ] Passed  [ ] Not passed — NEW badges appear only for new products.
- [ ] Passed  [ ] Not passed — price formatting uses the configured currency.
- [ ] Passed  [ ] Not passed — product card hover-to-discover behavior works with mouse and keyboard.
- [ ] Passed  [ ] Not passed — clicking a card opens the correct product detail route.
- [ ] Passed  [ ] Not passed — product image carousel arrows work and reset the timer.
- [ ] Passed  [ ] Not passed — carousel indicators reflect the active image.

## 5.2 Filtering and sorting

- [ ] Passed  [ ] Not passed — All, High Jewelry, Rings, Bracelets, and Timepieces filters return correct results.
- [ ] Passed  [ ] Not passed — filters can be changed repeatedly without stale results.
- [ ] Passed  [ ] Not passed — sorting Featured, low-to-high, and high-to-low works correctly.
- [ ] Passed  [ ] Not passed — collection filter drawers open and close on desktop.
- [ ] Passed  [ ] Not passed — collection filter drawers open and close on mobile.
- [ ] Passed  [ ] Not passed — applying a drawer selection updates only the intended collection.
- [ ] Passed  [ ] Not passed — reset filters returns catalog to its initial state.
- [ ] Passed  [ ] Not passed — URL filter/sort state can be copied and reopened correctly.
- [ ] Passed  [ ] Not passed — empty results show a translated empty state and reset action.
- [ ] Passed  [ ] Not passed — catalog error state is understandable and does not look like success.
- [ ] Passed  [ ] Not passed — filter controls are keyboard accessible.

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

- [ ] Passed  [ ] Not passed — a valid product route loads the correct product.
- [ ] Passed  [ ] Not passed — an invalid product route shows a useful not-found state.
- [ ] Passed  [ ] Not passed — the main product image and gallery load.
- [ ] Passed  [ ] Not passed — desktop hover zoom works without moving page content.
- [ ] Passed  [ ] Not passed — mobile tap/gesture image viewing works.
- [ ] Passed  [ ] Not passed — lightbox opens, closes, and supports next/previous controls.
- [ ] Passed  [ ] Not passed — Escape closes the lightbox/modal.
- [ ] Passed  [ ] Not passed — metal variants update image, price, and selected state.
- [ ] Passed  [ ] Not passed — invalid/unavailable variant selection is prevented or explained.
- [ ] Passed  [ ] Not passed — ring-size guide opens and closes.
- [ ] Passed  [ ] Not passed — ring-size conversion produces correct values.
- [ ] Passed  [ ] Not passed — accordions open and close independently.
- [ ] Passed  [ ] Not passed — reviews show only approved review content.
- [ ] Passed  [ ] Not passed — review empty and loading states are clear.
- [ ] Passed  [ ] Not passed — bespoke enquiry modal opens with the correct product.
- [ ] Passed  [ ] Not passed — enquiry validation catches missing/invalid fields.
- [ ] Passed  [ ] Not passed — successful enquiry submission shows a confirmation.
- [ ] Passed  [ ] Not passed — concierge, WhatsApp, and appointment CTAs go to the correct action.
- [ ] Passed  [ ] Not passed — onsite-only pickup messaging is accurate.
- [ ] Passed  [ ] Not passed — recommendations are relevant, clickable, and do not duplicate incorrectly.

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

- [ ] Passed  [ ] Not passed — search opens from desktop navigation.
- [ ] Passed  [ ] Not passed — search opens from mobile navigation.
- [ ] Passed  [ ] Not passed — typing a query returns relevant products/pages.
- [ ] Passed  [ ] Not passed — empty search results are translated and helpful.
- [ ] Passed  [ ] Not passed — clearing search resets results.
- [ ] Passed  [ ] Not passed — pressing Escape closes search.
- [ ] Passed  [ ] Not passed — search is usable with keyboard and screen reader labels.

## 7.2 Wishlist

- [ ] Passed  [ ] Not passed — adding a product to wishlist updates the icon immediately.
- [ ] Passed  [ ] Not passed — removing a product updates the icon immediately.
- [ ] Passed  [ ] Not passed — wishlist persists after refresh for a guest.
- [ ] Passed  [ ] Not passed — wishlist drawer opens on desktop.
- [ ] Passed  [ ] Not passed — wishlist drawer opens on mobile without stacking over the bag incorrectly.
- [ ] Passed  [ ] Not passed — wishlist product links open the correct PDP.
- [ ] Passed  [ ] Not passed — wishlist item can be moved to bag.
- [ ] Passed  [ ] Not passed — signed-in wishlist synchronizes with Supabase.
- [ ] Passed  [ ] Not passed — sign-in/sign-out does not unexpectedly lose or duplicate wishlist items.

## 7.3 Bag

- [ ] Passed  [ ] Not passed — adding a product opens or updates the bag as intended.
- [ ] Passed  [ ] Not passed — bag count is correct in desktop and mobile headers.
- [ ] Passed  [ ] Not passed — bag drawer opens and closes from all entry points.
- [ ] Passed  [ ] Not passed — overlay and close button have accessible labels.
- [ ] Passed  [ ] Not passed — quantity decrement stops at the intended minimum.
- [ ] Passed  [ ] Not passed — quantity increment updates line totals and subtotal.
- [ ] Passed  [ ] Not passed — removing an item updates count, subtotal, and empty state.
- [ ] Passed  [ ] Not passed — bag persists after refresh according to intended behavior.
- [ ] Passed  [ ] Not passed — onsite-only products show private boutique pickup messaging.
- [ ] Passed  [ ] Not passed — normal products show delivery messaging.
- [ ] Passed  [ ] Not passed — proceed-to-checkout is disabled for an empty bag.
- [ ] Passed  [ ] Not passed — continue shopping closes the drawer without losing items.

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

- [ ] Passed  [ ] Not passed — registration page loads in English and French.
- [ ] Passed  [ ] Not passed — title, first name, last name, email, country, phone, and password fields work.
- [ ] Passed  [ ] Not passed — invalid email is rejected with translated feedback.
- [ ] Passed  [ ] Not passed — weak password is rejected with translated feedback.
- [ ] Passed  [ ] Not passed — invalid Moroccan phone formats are rejected.
- [ ] Passed  [ ] Not passed — valid Moroccan phone formats are accepted.
- [ ] Passed  [ ] Not passed — CNDP consent is required before submission.
- [ ] Passed  [ ] Not passed — duplicate email is handled without exposing sensitive details.
- [ ] Passed  [ ] Not passed — successful registration displays verification instructions.
- [ ] Passed  [ ] Not passed — resend verification sends an email or reports a clear provider error.
- [ ] Passed  [ ] Not passed — registration form is usable on mobile without keyboard obstruction.

## 8.2 Login and session

- [ ] Passed  [ ] Not passed — valid credentials log in successfully.
- [ ] Passed  [ ] Not passed — invalid credentials show a useful error.
- [ ] Passed  [ ] Not passed — unconfirmed account exposes the resend verification action.
- [ ] Passed  [ ] Not passed — password visibility toggle works and is labeled.
- [ ] Passed  [ ] Not passed — login drawer and login page behave consistently.
- [ ] Passed  [ ] Not passed — close buttons and Escape close the login drawer/modal.
- [ ] Passed  [ ] Not passed — session persists after refresh.
- [ ] Passed  [ ] Not passed — sign out clears protected customer data from the UI.
- [ ] Passed  [ ] Not passed — logged-out users are redirected from protected account routes.
- [ ] Passed  [ ] Not passed — logged-out users cannot access admin content by guessing URLs.

## 8.3 Account

- [ ] Passed  [ ] Not passed — account profile displays the signed-in customer.
- [ ] Passed  [ ] Not passed — address can be created, edited, selected, and deleted.
- [ ] Passed  [ ] Not passed — invalid address fields are validated.
- [ ] Passed  [ ] Not passed — order history loads only the current customer’s orders.
- [ ] Passed  [ ] Not passed — order tracker displays correct status and totals.
- [ ] Passed  [ ] Not passed — invoice/tax receipt download works and contains correct DH totals.
- [ ] Passed  [ ] Not passed — CNDP export request can be submitted.
- [ ] Passed  [ ] Not passed — CNDP erasure request requires the intended confirmation.
- [ ] Passed  [ ] Not passed — feedback modal opens with account context and submits correctly.

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

- [ ] Passed  [ ] Not passed — checkout redirects to login when authentication is required.
- [ ] Passed  [ ] Not passed — checkout loads with a valid bag.
- [ ] Passed  [ ] Not passed — customer can select a saved address.
- [ ] Passed  [ ] Not passed — customer can enter a new delivery address.
- [ ] Passed  [ ] Not passed — required checkout fields validate correctly.
- [ ] Passed  [ ] Not passed — city selection updates delivery pricing.
- [ ] Passed  [ ] Not passed — Ameex city pricing is shown accurately.
- [ ] Passed  [ ] Not passed — onsite-only products force boutique pickup and block incompatible delivery.
- [ ] Passed  [ ] Not passed — mixed onsite/delivery cart behavior follows the intended business rule.
- [ ] Passed  [ ] Not passed — order summary matches bag line items and quantities.
- [ ] Passed  [ ] Not passed — subtotal, delivery fee, tax, and total use correct currency and rounding.

## 9.2 Payment and order creation

- [ ] Passed  [ ] Not passed — cash-on-delivery selection works.
- [ ] Passed  [ ] Not passed — unavailable payment options are disabled or explained.
- [ ] Passed  [ ] Not passed — submitting once does not create duplicate orders.
- [ ] Passed  [ ] Not passed — submitting with a network failure shows a retry-safe error.
- [ ] Passed  [ ] Not passed — successful order displays confirmation and order reference.
- [ ] Passed  [ ] Not passed — successful order appears in the customer account.
- [ ] Passed  [ ] Not passed — cart clears only after confirmed order creation.
- [ ] Passed  [ ] Not passed — checkout start and purchase analytics fire only once per intended event.
- [ ] Passed  [ ] Not passed — receipt/invoice download includes customer/order/tax/Ameex data.
- [ ] Passed  [ ] Not passed — mobile checkout fields, sticky totals, and submit controls remain usable.

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

- [ ] Passed  [ ] Not passed — Concierge page loads in both languages.
- [ ] Passed  [ ] Not passed — boutique/location selector works.
- [ ] Passed  [ ] Not passed — appointment date picker blocks invalid/past dates.
- [ ] Passed  [ ] Not passed — available time slots load and display correctly.
- [ ] Passed  [ ] Not passed — guest count validation works.
- [ ] Passed  [ ] Not passed — consultation focus selection works.
- [ ] Passed  [ ] Not passed — unauthenticated appointment flow requests sign-in as intended.
- [ ] Passed  [ ] Not passed — authenticated customer can submit an appointment.
- [ ] Passed  [ ] Not passed — duplicate appointment submission is prevented.
- [ ] Passed  [ ] Not passed — appointment confirmation is visible to the customer.
- [ ] Passed  [ ] Not passed — admin sees the appointment with correct customer/date/time.
- [ ] Passed  [ ] Not passed — admin can confirm an appointment.
- [ ] Passed  [ ] Not passed — admin can cancel an appointment.
- [ ] Passed  [ ] Not passed — admin can reschedule an appointment.
- [ ] Passed  [ ] Not passed — customer-facing status reflects confirmation/cancellation/reschedule.
- [ ] Passed  [ ] Not passed — confirmed booking exports a valid `.ics` file.
- [ ] Passed  [ ] Not passed — exported event has correct title, date, timezone, duration, and location.
- [ ] Passed  [ ] Not passed — configured calendar webhook receives confirmation payload.
- [ ] Passed  [ ] Not passed — configured calendar webhook receives reschedule payload.
- [ ] Passed  [ ] Not passed — webhook failure is surfaced/logged without falsely reporting success.
- [ ] Passed  [ ] Not passed — no webhook URL configured does not break appointment confirmation.
- [ ] Passed  [ ] Not passed — appointment controls are usable on mobile.

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

- [ ] Passed  [ ] Not passed — first visit displays the cookie banner.
- [ ] Passed  [ ] Not passed — strictly necessary category is enabled and disabled control cannot be changed.
- [ ] Passed  [ ] Not passed — analytics category can be enabled and disabled.
- [ ] Passed  [ ] Not passed — functional category can be enabled and disabled.
- [ ] Passed  [ ] Not passed — Customize/Personnaliser opens the detailed modal.
- [ ] Passed  [ ] Not passed — each category has a clear translated explanation.
- [ ] Passed  [ ] Not passed — accept-all persists all optional selections.
- [ ] Passed  [ ] Not passed — reject-optional persists only necessary consent.
- [ ] Passed  [ ] Not passed — save-custom persists the exact chosen selections.
- [ ] Passed  [ ] Not passed — selections are saved under `maison_cookie_preferences`.
- [ ] Passed  [ ] Not passed — refreshing restores the saved selections.
- [ ] Passed  [ ] Not passed — GA4 script does not load before analytics consent.
- [ ] Passed  [ ] Not passed — GA4 script loads after analytics consent and configured ID.
- [ ] Passed  [ ] Not passed — disabling analytics removes/blocks future analytics loading as intended.
- [ ] Passed  [ ] Not passed — functional preference controls affect only functional features.
- [ ] Passed  [ ] Not passed — necessary authentication/cart/language behavior remains available after rejecting optional cookies.
- [ ] Passed  [ ] Not passed — cookie controls are keyboard accessible and readable on mobile.
- [ ] Passed  [ ] Not passed — privacy/cookies page matches actual behavior.

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

- [ ] Passed  [ ] Not passed — admin login accepts a valid authorized account.
- [ ] Passed  [ ] Not passed — admin login rejects invalid credentials.
- [ ] Passed  [ ] Not passed — a customer account cannot access admin.
- [ ] Passed  [ ] Not passed — `super_admin` sees all permitted workspaces.
- [ ] Passed  [ ] Not passed — `admin` sees only intended workspaces.
- [ ] Passed  [ ] Not passed — `staff_catalog` cannot manage orders or settings.
- [ ] Passed  [ ] Not passed — `staff_orders` cannot manage products or settings.
- [ ] Passed  [ ] Not passed — permission-denied navigation is hidden or blocked.
- [ ] Passed  [ ] Not passed — direct URL access to unauthorized admin tabs is blocked.
- [ ] Passed  [ ] Not passed — unauthorized mutation requests are rejected by the database/RLS.
- [ ] Passed  [ ] Not passed — sign-out removes admin access immediately.
- [ ] Passed  [ ] Not passed — admin session refresh does not leak data between accounts.
- [ ] Passed  [ ] Not passed — staff creation requires the intended permission.
- [ ] Passed  [ ] Not passed — staff role and permission display matches saved data.
- [ ] Passed  [ ] Not passed — service-role credentials never reach the browser.
- [ ] Passed  [ ] Not passed — admin UI remains usable on mobile/tablet even if desktop-first.

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

- [ ] Passed  [ ] Not passed — settings page loads only for authorized staff.
- [ ] Passed  [ ] Not passed — website name can be edited and saved.
- [ ] Passed  [ ] Not passed — logo/brand settings can be edited as implemented.
- [ ] Passed  [ ] Not passed — light and dark design tokens can be edited and saved.
- [ ] Passed  [ ] Not passed — currency configuration updates storefront prices.
- [ ] Passed  [ ] Not passed — contact information updates visible contact surfaces.
- [ ] Passed  [ ] Not passed — social links validate allowed URL formats.
- [ ] Passed  [ ] Not passed — boutique map URL accepts only the intended secure Google Maps format.
- [ ] Passed  [ ] Not passed — invalid map URL is rejected with clear feedback.
- [ ] Passed  [ ] Not passed — appointment calendar API/webhook URL can be saved.
- [ ] Passed  [ ] Not passed — GA4 tracking ID can be saved without loading analytics prematurely.
- [ ] Passed  [ ] Not passed — preview reflects unsaved values without accidentally publishing them.
- [ ] Passed  [ ] Not passed — save success is visible and persists after refresh.
- [ ] Passed  [ ] Not passed — save failure is visible and does not show false success.
- [ ] Passed  [ ] Not passed — settings changes are isolated from unrelated configuration.

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

- [ ] Passed  [ ] Not passed — product list loads with correct records and pagination/filters.
- [ ] Passed  [ ] Not passed — product creation form opens and closes.
- [ ] Passed  [ ] Not passed — required product fields validate.
- [ ] Passed  [ ] Not passed — category and collection selectors load database values.
- [ ] Passed  [ ] Not passed — taxonomy fallback behaves safely when data is unavailable.
- [ ] Passed  [ ] Not passed — price fields save in the canonical model.
- [ ] Passed  [ ] Not passed — image URLs validate and display in preview.
- [ ] Passed  [ ] Not passed — novelty/new state saves correctly.
- [ ] Passed  [ ] Not passed — onsite-only toggle has correct ON/OFF styling.
- [ ] Passed  [ ] Not passed — toggling a real UUID product persists to Supabase.
- [ ] Passed  [ ] Not passed — toggling a mock product updates local state without UUID error.
- [ ] Passed  [ ] Not passed — mock product shows the intended local-update notice.
- [ ] Passed  [ ] Not passed — product update failure is shown and does not pretend to save.
- [ ] Passed  [ ] Not passed — product deletion requires intended confirmation and removes only the selected product.
- [ ] Passed  [ ] Not passed — staff permissions prevent unauthorized catalog mutations.
- [ ] Passed  [ ] Not passed — catalog forms remain usable on tablet/mobile widths.

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

- [ ] Passed  [ ] Not passed — admin orders list loads correct orders.
- [ ] Passed  [ ] Not passed — order details show accurate customer, items, totals, city, and payment method.
- [ ] Passed  [ ] Not passed — order status update persists.
- [ ] Passed  [ ] Not passed — unauthorized staff cannot update orders.
- [ ] Passed  [ ] Not passed — Ameex feature flag defaults safely.
- [ ] Passed  [ ] Not passed — Ameex dispatch is not sent unless explicitly enabled.
- [ ] Passed  [ ] Not passed — valid sandbox parcel creation returns and persists a tracking reference.
- [ ] Passed  [ ] Not passed — Ameex API failure shows a recoverable error.
- [ ] Passed  [ ] Not passed — signed webhook rejects invalid signatures.
- [ ] Passed  [ ] Not passed — valid webhook updates tracking/status correctly.
- [ ] Passed  [ ] Not passed — duplicate webhook delivery is idempotent.
- [ ] Passed  [ ] Not passed — customer order tracker reflects the updated status.

## 15.2 Analytics and feedback

- [ ] Passed  [ ] Not passed — analytics dashboard is visible only to permitted staff.
- [ ] Passed  [ ] Not passed — revenue total matches source orders.
- [ ] Passed  [ ] Not passed — AOV calculation is correct.
- [ ] Passed  [ ] Not passed — order velocity/time range is correct.
- [ ] Passed  [ ] Not passed — regional distribution uses correct order locations.
- [ ] Passed  [ ] Not passed — activity feed does not expose unnecessary private information.
- [ ] Passed  [ ] Not passed — page-view events record intended routes only.
- [ ] Passed  [ ] Not passed — checkout-start events are not duplicated on rerenders.
- [ ] Passed  [ ] Not passed — purchase events fire only after successful order creation.
- [ ] Passed  [ ] Not passed — feedback form validates and saves a submission.
- [ ] Passed  [ ] Not passed — feedback failure is visible to the user.

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

- [ ] Passed  [ ] Not passed — all interactive controls are reachable by keyboard.
- [ ] Passed  [ ] Not passed — focus order follows the visual and task order.
- [ ] Passed  [ ] Not passed — focus is visible in both themes.
- [ ] Passed  [ ] Not passed — Enter activates focused buttons/links.
- [ ] Passed  [ ] Not passed — Escape closes open menus, drawers, and modals where expected.
- [ ] Passed  [ ] Not passed — modal/drawer focus does not become trapped behind the overlay.
- [ ] Passed  [ ] Not passed — images have appropriate alt text.
- [ ] Passed  [ ] Not passed — decorative icons are not announced redundantly.
- [ ] Passed  [ ] Not passed — form labels are associated with their controls.
- [ ] Passed  [ ] Not passed — validation errors identify the affected field.
- [ ] Passed  [ ] Not passed — status/toast messages are understandable without relying on color.
- [ ] Passed  [ ] Not passed — text contrast is readable in light and dark themes.
- [ ] Passed  [ ] Not passed — controls have adequate touch target size on mobile.
- [ ] Passed  [ ] Not passed — reduced-motion preference does not make content unusable.
- [ ] Passed  [ ] Not passed — zooming to 200% does not hide essential content.
- [ ] Passed  [ ] Not passed — a screen reader can identify headings, landmarks, forms, and buttons.

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

- [ ] Passed  [ ] Not passed — initial page load is acceptable on a throttled mobile connection.
- [ ] Passed  [ ] Not passed — images use appropriate dimensions/compression and do not block the page unnecessarily.
- [ ] Passed  [ ] Not passed — image skeletons reserve layout space.
- [ ] Passed  [ ] Not passed — there are no major cumulative layout shifts while images load.
- [ ] Passed  [ ] Not passed — route transitions do not leave stale loaders visible.
- [ ] Passed  [ ] Not passed — a slow Supabase request shows a loading state.
- [ ] Passed  [ ] Not passed — a failed Supabase request shows an actionable error state.
- [ ] Passed  [ ] Not passed — retrying after a transient failure works.
- [ ] Passed  [ ] Not passed — the page remains usable if optional analytics fails.
- [ ] Passed  [ ] Not passed — the page remains usable if optional calendar sync fails.
- [ ] Passed  [ ] Not passed — SEO titles and descriptions are unique for major routes.
- [ ] Passed  [ ] Not passed — canonical URLs are correct.
- [ ] Passed  [ ] Not passed — policy-only pages have intended indexing/noindex behavior.
- [ ] Passed  [ ] Not passed — JSON-LD is valid and contains no placeholder values.
- [ ] Passed  [ ] Not passed — browser console has no hydration, key, or accessibility errors.

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

- [ ] Passed  [ ] Not passed — Desktop Chrome latest.
- [ ] Passed  [ ] Not passed — Desktop Edge latest.
- [ ] Passed  [ ] Not passed — Desktop Firefox latest.
- [ ] Passed  [ ] Not passed — iPhone Safari current.
- [ ] Passed  [ ] Not passed — Android Chrome current.
- [ ] Passed  [ ] Not passed — 320 px narrow mobile viewport.
- [ ] Passed  [ ] Not passed — 390 px mobile viewport.
- [ ] Passed  [ ] Not passed — 768 px tablet viewport.
- [ ] Passed  [ ] Not passed — 1440 px desktop viewport.
- [ ] Passed  [ ] Not passed — English smoke path.
- [ ] Passed  [ ] Not passed — French smoke path.
- [ ] Passed  [ ] Not passed — light-theme smoke path.
- [ ] Passed  [ ] Not passed — dark-theme smoke path.
- [ ] Passed  [ ] Not passed — clean/incognito consent and authentication path.
- [ ] Passed  [ ] Not passed — returning-user persistence path.

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
