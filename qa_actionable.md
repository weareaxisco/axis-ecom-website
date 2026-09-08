# QA Actionable Tasks

This file contains only the failed or incomplete checks extracted from lines
1–570 of `qa_acceptance_checklist_v2.md`. Fix each task, retest it, and tick
the checkbox only after the original reproduction steps pass.

## 1. Automated and deployment gates

### 1.1 Local verification

- [x] **QA-1.1-01 — Remove uncaught React console errors.** Fix the duplicate
  `/concierge` child key warning and investigate the catalog fallback warning
  so critical routes do not produce unexpected console errors or warnings.

<details>
<summary>Failure description</summary>

**Observed:** `react-dom_client.js` reports two children with the same key,
`/concierge`. `ProductCatalog.jsx` also logs that Supabase returned no products
and is showing fallback creations. The tester expected no errors.

**Severity:** Minor to Major  
**Expected:** No new uncaught errors or duplicate-key warnings on critical routes.  
**Retest:** Open the homepage and critical routes with DevTools Console visible,
then reload and navigate repeatedly.

</details>

### 1.2 Routing and refresh smoke test

- [x] **QA-1.2-01 — Fix initial homepage startup errors and flashes.** The `/`
  route must load without caught errors, a blank/white flash, or visible
  startup glitches.
- [x] **QA-1.2-02 — Complete the Newsletter footer action.** The Newsletter
  button must perform its intended action or be removed/replaced with a real
  destination; it must not be a dead control.
- [ ] **QA-1.2-03 — Implement the intended unknown-route fallback.** An
  unknown URL must show a deliberate not-found/fallback view instead of a
  broken or blank application.

<details>
<summary>Failure description</summary>

**Observed:** Errors appear when first opening the website. The tester attached
`image.png`. Footer links work except the Newsletter button. The unknown-route
fallback check was not passed.

**Severity:** Not specified; treat startup/routing as Blocker and Newsletter as
Major until retested.  
**Expected:** Homepage startup is clean, Newsletter is functional, and unknown
routes have an intentional fallback.  
**Retest:** Open `/` in a clean browser, activate Newsletter, and visit a
random path such as `/does-not-exist`.

</details>

## 2. Global shell, brand, theme, and responsive behavior

### 2.1 Desktop shell

- [x] **QA-2.1-01 — Make the desktop header sticky.** Apply sticky positioning
  to the desktop navigation container with the intended top offset and z-index.
- [x] **QA-2.1-02 — Prevent loader/background hydration overlap.** The global
  loader must fully cover underlying content until hydration is ready and must
  not flicker or reveal raw background DOM.

<details>
<summary>Failure description</summary>

**Observed:** The header is not sticky on desktop viewports; sticky behavior
only triggers at mobile breakpoints. The global loading screen flickers and
visually overlaps background content before hydration completes.

**Severity:** Minor  
**Expected:** Desktop navigation remains available while scrolling, and loading
transitions do not expose a flash or overlapping background.  
**Retest:** Test at 1440 px on `/`, `/concierge`, and another long page while
watching the first load and a hard refresh.

</details>

### 2.2 Mobile shell

- [x] **QA-2.2-01 — Make the mobile menu reliably open and close.** Verify
  menu state, visible close controls, Escape behavior, and route navigation.
- [ ] **QA-2.2-02 — Add a close control to the mobile signup drawer/modal.** Add
  a prominent accessible X/close button and bind it to dismiss the overlay.
- [ ] **QA-2.2-03 — Restrict the WhatsApp floating action to approved routes.**
  Use a route whitelist or equivalent configuration rather than rendering it
  globally.

<details>
<summary>Failure description</summary>

**Observed:** The mobile menu check failed. The signup drawer/modal has no X or
other exit mechanism and can soft-lock the user. The WhatsApp floating action
appears globally instead of only on approved routes.

**Severity:** Major  
**Expected:** All mobile overlays can be dismissed, and WhatsApp appears only on
designated routes.  
**Retest:** Test at 390 px, open/close the menu and signup overlay, press
Escape, tap the overlay, and inspect several public/admin routes.

</details>

### 2.3 Theme and brand configuration

- [ ] **QA-2.3-01 — Apply light-theme tokens across all surfaces.** Search,
  Concierge, WhatsApp, cart, wishlist, checkout, and every admin screen must
  respond to the active light theme rather than remaining dark.
- [ ] **QA-2.3-02 — Apply dark-theme tokens consistently.** Verify all the
  same surfaces remain readable and use the configured dark tokens.
- [ ] **QA-2.3-03 — Stabilize maison-name hydration.** A changed maison name
  must not flicker between the new value and a cached fallback in the loader.
- [ ] **QA-2.3-04 — Synchronize the WhatsApp number from site configuration.**
  Changing the phone number in Admin Settings must update the floating
  WhatsApp destination as well as the footer.
- [ ] **QA-2.3-05 — Preserve the active admin tab after refresh.** Store the
  selected tab in URL parameters or session storage and restore it on reload.

<details>
<summary>Failure description</summary>

**Observed:** Search, Concierge, WhatsApp, Cart, Wishlist, Checkout, and Admin
surfaces stay dark under the light theme. Changing the maison name causes a
loader flicker between new and old cached values. The footer phone updates but
the floating WhatsApp link does not. Refreshing Admin resets the selected tab.

**Severity:** Major  
**Expected:** Theme tokens, brand state, contact links, and admin tab state stay
consistent after save, navigation, and refresh.  
**Retest:** Change theme/settings in Admin, inspect all listed surfaces, update
the phone, click WhatsApp, select a non-default admin tab, and refresh.

</details>

## 3. Localization and language persistence

- [ ] **QA-3-01 — Localize Admin Inventory and Analysis.** Extract table
  headers, metrics, labels, and content into the translation dictionaries and
  render them through the language hook.
- [ ] **QA-3-02 — Localize the mobile product filter drawer.** Translate all
  labels and options dynamically in English and French.

<details>
<summary>Failure description</summary>

**Observed:** Admin Inventory table headers and all Admin Analysis metrics and
content remain English when French is selected. Mobile product filter drawer
labels/options also remain English.

**Severity:** Minor  
**Expected:** Storefront filters and all Admin workspaces switch immediately
between English and French.  
**Retest:** Switch to French, inspect `/catalog` mobile filter controls and
Admin Inventory/Analysis tabs, then switch back to English.

</details>

## 4. Home page, editorial content, and discoverability

### 4.1 Home page

- [ ] **QA-4.1-01 — Consolidate the hero CTA.** Render one primary
  “Discover Now”/“Découvrir” button linking to `/catalog`; remove competing
  hero actions unless intentionally reapproved.
- [ ] **QA-4.1-02 — Enable natural mobile carousel swiping.** Correct touch
  event propagation so horizontal swipes work without first tapping a card.
- [ ] **QA-4.1-03 — Repair the second carousel slide asset.** Replace the
  invalid image source with a valid asset and verify it loads in both themes.

<details>
<summary>Failure description</summary>

**Observed:** The hero displays two competing CTAs instead of one catalog CTA.
Mobile carousel swiping does not work until a card is tapped. The second
carousel slide renders as a dark/black container because its image fails.

**Severity:** Major  
**Expected:** One clear catalog CTA, touch-friendly swiping, and valid images on
all slides.  
**Retest:** Test `/` on desktop and 390 px mobile, swipe without tapping first,
and inspect every carousel slide.

</details>

## 5. Catalog, filters, sorting, and product cards

### 5.1 Catalog rendering

- [ ] **QA-5.1-01 — Render structured fallback products when Supabase is empty
  or unavailable.** Populate the catalog state with valid mock creations on
  empty responses and network errors.
- [ ] **QA-5.1-02 — Prevent UUID writes for mock products.** Ensure fallback
  product interactions never send mock IDs to UUID database columns and show a
  clear local-update message where applicable.
- [ ] **QA-5.1-03 — Remove the initial hydration white flash.** Refactor the
  root/loading styles so the configured background and loader appear before
  underlying unrendered DOM can flash.

<details>
<summary>Failure description</summary>

**Observed:** Fallback mock creations fail to mount when the catalog is empty or
Supabase/network requests fail. Initial load briefly shows a blank white flash
before the maison name, with visual glitches during page transitions.

**Severity:** Major  
**Expected:** Catalog fallback products always mount safely, mock records never
cause invalid UUID writes, and hydration transitions are visually stable.  
**Retest:** Simulate an empty/error catalog response, interact with a mock
product, hard-refresh on desktop/mobile, and observe route transitions.

</details>
