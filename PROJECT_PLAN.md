# Master Blueprint: White-Label Luxury Jewelry Platform

- [x] Step 0: Repository Scaffolding & Base Supabase Client Setup
- [ ] Step 1: Enterprise Database Architecture (SQL migrations for Config, RBAC, Taxonomy, Products, Reviews & Enquiries) — Config, RBAC, products, orders, and appointments exist; relational taxonomy, reviews, and enquiries are not yet implemented.
- [ ] Step 2: Global State & Dynamic Theme Engine (`useSiteConfig` with Dual Light/Dark Luxury CSS Variables) — Site settings and theme switching exist, but persisted design-token fields and complete dual-palette administration are not yet verified.
- [x] Step 3: Minimalist Chopard-Inspired Header, Navigation & Dynamic Brand Switcher
- [x] Step 4: High-Impact Hero Banner & Storytelling Collections Carousel
- [x] Step 5: Advanced Jewelry Catalog (Chopard card precision: subtitle-to-button hover swap, NEW badges, dash/dot carousel indicators, arrow timer resets, image zoom)
- [ ] Step 6: Dedicated Product Detail Page (`/product/:id`) with high-res gallery, specs, boutique concierge CTA, and approved customer reviews — PDP and gallery exist; approved customer review data/schema is not implemented.
- [x] Step 6a: YOU MAY ALSO LIKE recommendation engine
- [x] Step 7: Customer Interaction Layer (Concierge and appointment flow)
- [x] Step 8: Supabase Auth Engine (Customer Sign Up/Log In & Admin Protected Route Guards) — Core auth and `/login` route exist; automated coverage currently has an FR/EN label mismatch.
- [x] Step 9: Enterprise Admin Dashboard (Admin base, RLS, product inventory and order operations)
- [ ] Step 10: Customer account dashboard, order tracking, Moroccan address book, CNDP export/deletion controls — Account, order tracking, and addresses exist; CNDP export/deletion controls are not verified.
- [x] Step 11: VIP WhatsApp concierge, route-aware messaging, and private boutique appointment scheduler
- [ ] Step 12: French/English localization with persistent language switching and translated core storefront/admin UI — Language switching and persistence exist; E2E locale failures are fixed, but some hardcoded labels remain.
- [x] Step 13: Wishlist system with local persistence, Supabase profile synchronization, drawer/account views, clickable products, and add-to-bag actions
- [x] Step 14: Product catalog filtering, sorting, URL state sharing, responsive grid density controls, and product-card galleries
- [x] Step 15: Luxury PDP interactions: image zoom/lightbox, metal variants, ring-size conversion, accordions, and onsite pickup CTAs
- [ ] Step 16: SEO metadata/JSON-LD, zero-shift image skeletons, invoice/receipt printing, CI workflow, Vitest, and Playwright critical-path coverage — SEO, CI, unit tests, true PDF download, and all current E2E paths exist; lint warnings and oversized chunks remain.

## Current Sprint

- [ ] Cart, checkout, Ameex shipping, onsite-only pickup, admin base, RLS, and FR/EN i18n — core flows exist; localization has remaining coverage and E2E mismatches.
- [x] Site Settings Management
- [ ] Product Creation Form — creation works, but taxonomy values are hardcoded and legacy field alignment remains.
- [x] Wishlist Drawer and Supabase synchronization, including clickable listings and add-to-bag actions
- [ ] FR/EN coverage across customer and admin surfaces, including mobile navigation parity — switching works, but some labels remain hardcoded.
- [x] Responsive consistency pass for navigation, wishlist, catalog, account, checkout, and currency display
- [x] Appointment persistence aligned with deployed Supabase schema, including authenticated ownership and guest count

## Catalog Architecture

- **Admin Product Attributes & Taxonomy System**: Define database entities for `Attributes` and `AttributeValues`. Configure Admin Product Creation forms to query these taxonomies as standardized dropdowns for Category, Metal, Gender, Shape, and Novelty rather than manual text entry, keeping storefront drawer facets synchronized automatically. **Status: not implemented; the current form uses hardcoded category and collection arrays.**

## Remaining Backlog

- [x] Replace print-window invoice export with a true downloadable PDF file and verify Moroccan tax receipt formatting end-to-end — client-side PDF blob download now includes ICE/IF, tax summary, itemized DH pricing, and Ameex tracking.
- [x] Add the `/login` route for account redirects and direct authentication.
- [x] Complete live appointment management in Admin, including confirmation, rescheduling, and cancellation — status changes and date/time rescheduling are implemented.
- [ ] Align all remaining legacy product fields (`price`, image aliases, category aliases) with the canonical Supabase product model — shared `getProductPrice` normalization now covers the main catalog, PDP, cart, checkout, and admin table surfaces.
- [ ] Finish taxonomy-driven product creation and filter values using database-backed attributes rather than hardcoded options.
- [ ] Add missing database entities and CRUD flows for reviews and concierge enquiries.
- [ ] Verify and implement CNDP account export/deletion controls.
- [ ] Complete localization coverage and update E2E selectors/fixtures so critical paths pass in the default language — Playwright fixtures now force English and all three E2E tests pass.
- [ ] Add focused automated coverage for language switching, mobile wishlist actions, admin settings, product creation, and appointment submission.
- [ ] Resolve non-blocking lint warnings and split oversized vendor chunks for the mobile performance target.
- [x] Add admin appointment operations with status management.