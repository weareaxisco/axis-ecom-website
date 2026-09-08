# Master Blueprint: White-Label Luxury Jewelry Platform

- [x] Step 0: Repository Scaffolding & Base Supabase Client Setup
- [x] Step 1: Enterprise Database Architecture (SQL Migrations for Config, RBAC, Taxonomy, Products, Reviews & Enquiries)
- [x] Step 2: Global State & Dynamic Theme Engine (`useSiteConfig` with Dual Light/Dark Luxury CSS Variables)
- [x] Step 3: Minimalist Chopard-Inspired Header, Navigation & Dynamic Brand Switcher
- [x] Step 4: High-Impact Hero Banner & Storytelling Collections Carousel
- [x] Step 5: Advanced Jewelry Catalog (Chopard card precision: subtitle-to-button hover swap, NEW badges, dash/dot carousel indicators, arrow timer resets, image zoom)
- [x] Step 6: Dedicated Product Detail Page (`/product/:id`) with high-res gallery, specs, boutique concierge CTA, and approved customer reviews
- [x] Step 6a: YOU MAY ALSO LIKE recommendation engine
- [x] Step 7: Customer Interaction Layer (Concierge and appointment flow)
- [x] Step 8: Supabase Auth Engine (Customer Sign Up/Log In & Admin Protected Route Guards)
- [x] Step 9: Enterprise Admin Dashboard (Admin base, RLS, product inventory and order operations)
- [x] Step 10: Customer account dashboard, order tracking, Moroccan address book, CNDP export/deletion controls
- [x] Step 11: VIP WhatsApp concierge, route-aware messaging, and private boutique appointment scheduler
- [x] Step 12: French/English localization with persistent language switching and translated core storefront/admin UI
- [x] Step 13: Wishlist system with local persistence, Supabase profile synchronization, drawer/account views, clickable products, and add-to-bag actions
- [x] Step 14: Product catalog filtering, sorting, URL state sharing, responsive grid density controls, and product-card galleries
- [x] Step 15: Luxury PDP interactions: image zoom/lightbox, metal variants, ring-size conversion, accordions, and onsite pickup CTAs
- [x] Step 16: SEO metadata/JSON-LD, zero-shift image skeletons, invoice/receipt printing, CI workflow, Vitest, and Playwright critical-path coverage

## Current Sprint

- [x] Cart, checkout, Ameex shipping, onsite-only pickup, admin base, RLS, and FR/EN i18n
- [x] Site Settings Management
- [x] Product Creation Form
- [x] Wishlist Drawer and Supabase synchronization, including clickable listings and add-to-bag actions
- [x] FR/EN coverage across customer and admin surfaces, including mobile navigation parity
- [x] Responsive consistency pass for navigation, wishlist, catalog, account, checkout, and currency display
- [x] Appointment persistence aligned with deployed Supabase schema, including authenticated ownership and guest count

## Catalog Architecture

- **Admin Product Attributes & Taxonomy System**: Define database entities for `Attributes` and `AttributeValues`. Configure Admin Product Creation forms to query these taxonomies as standardized dropdowns for Category, Metal, Gender, Shape, and Novelty rather than manual text entry, keeping storefront drawer facets synchronized automatically.

## Remaining Backlog

- [ ] Replace print-window invoice export with a true downloadable PDF file and verify Moroccan tax receipt formatting end-to-end.
- [ ] Add the missing `/login` route or replace account/admin redirects with the existing login drawer flow.
- [ ] Complete live appointment management in Admin, including confirmation, rescheduling, and cancellation.
- [ ] Align all remaining legacy product fields (`price`, image aliases, category aliases) with the canonical Supabase product model.
- [ ] Finish taxonomy-driven product creation and filter values using database-backed attributes rather than hardcoded options.
- [ ] Add focused automated coverage for language switching, mobile wishlist actions, admin settings, product creation, and appointment submission.
- [ ] Resolve non-blocking lint warnings and split oversized vendor chunks for the mobile performance target.
- [x] Add a dedicated `/login` route for account redirects and direct authentication.
- [x] Add admin appointment operations with status management.