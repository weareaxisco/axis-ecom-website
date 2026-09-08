# Master Blueprint: White-Label Luxury Jewelry Platform

- [x] Step 0: Repository Scaffolding & Base Supabase Client Setup
- [x] Step 1: Enterprise Database Architecture (SQL migrations for Config, RBAC, Taxonomy, Products, Reviews & Enquiries) — Config, RBAC, products, orders, appointments, taxonomy, reviews, enquiries, and CNDP request tables are implemented.
- [x] Step 2: Global State & Dynamic Theme Engine (`useSiteConfig` with Dual Light/Dark Luxury CSS Variables) — Site settings and theme switching are implemented.
- [x] Step 3: Minimalist Chopard-Inspired Header, Navigation & Dynamic Brand Switcher
- [x] Step 4: High-Impact Hero Banner & Storytelling Collections Carousel
- [x] Step 5: Advanced Jewelry Catalog (Chopard card precision: subtitle-to-button hover swap, NEW badges, dash/dot carousel indicators, arrow timer resets, image zoom)
- [x] Step 6: Dedicated Product Detail Page (`/product/:id`) with high-res gallery, specs, boutique concierge CTA, and approved customer reviews — PDP reviews and bespoke enquiry flow are implemented.
- [x] Step 6a: YOU MAY ALSO LIKE recommendation engine
- [x] Step 7: Customer Interaction Layer (Concierge and appointment flow)
- [x] Step 8: Supabase Auth Engine (Customer Sign Up/Log In & Admin Protected Route Guards) — Core auth and `/login` route exist; Playwright authentication coverage passes with the English locale fixture.
- [x] Step 9: Enterprise Admin Dashboard (Admin base, RLS, product inventory and order operations)
- [x] Step 10: Customer account dashboard, order tracking, Moroccan address book, CNDP export/deletion controls — Account privacy export and erasure request controls are implemented.
- [x] Step 11: VIP WhatsApp concierge, route-aware messaging, and private boutique appointment scheduler
- [x] Step 12: French/English localization with persistent language switching and translated core storefront/admin UI — Language switching persists and critical E2E coverage passes.
- [x] Step 13: Wishlist system with local persistence, Supabase profile synchronization, drawer/account views, clickable products, and add-to-bag actions
- [x] Step 14: Product catalog filtering, sorting, URL state sharing, responsive grid density controls, and product-card galleries
- [x] Step 15: Luxury PDP interactions: image zoom/lightbox, metal variants, ring-size conversion, accordions, and onsite pickup CTAs
- [x] Step 16: SEO metadata/JSON-LD, zero-shift image skeletons, invoice/receipt printing, CI workflow, Vitest, Playwright critical-path coverage, and optimized manual chunks.

## Current Sprint

- [x] Cart, checkout, Ameex shipping, onsite-only pickup, admin base, RLS, and FR/EN i18n
- [x] Site Settings Management
- [x] Product Creation Form — database-backed category and collection selectors with graceful fallback.
- [x] Wishlist Drawer and Supabase synchronization, including clickable listings and add-to-bag actions
- [x] FR/EN coverage across customer and admin surfaces, including mobile navigation parity
- [x] Responsive consistency pass for navigation, wishlist, catalog, account, checkout, and currency display
- [x] Appointment persistence aligned with deployed Supabase schema, including authenticated ownership and guest count

## Catalog Architecture

- **Admin Product Attributes & Taxonomy System**: Define database entities for `Attributes` and `AttributeValues`. Configure Admin Product Creation forms to query these taxonomies as standardized dropdowns for Category, Metal, Gender, Shape, and Novelty rather than manual text entry, keeping storefront drawer facets synchronized automatically. **Status: implemented for database-backed attribute records and admin selectors; storefront attribute facets remain a follow-up.**

## Remaining Backlog

- [x] Replace print-window invoice export with a true downloadable PDF file and verify Moroccan tax receipt formatting end-to-end — client-side PDF blob download now includes ICE/IF, tax summary, itemized DH pricing, and Ameex tracking.
- [x] Add the `/login` route for account redirects and direct authentication.
- [x] Complete live appointment management in Admin, including confirmation, rescheduling, and cancellation — status changes and date/time rescheduling are implemented.
- [x] Align legacy product price fields with the canonical Supabase product model via shared `getProductPrice`.
- [x] Finish taxonomy-driven product creation and filter values using database-backed categories and collections.
- [x] Add database entities and CRUD flows for reviews and bespoke product enquiries.
- [x] Implement CNDP account export and erasure request controls.
- [x] Complete localization coverage and update E2E selectors/fixtures so critical paths pass in the default language — all three E2E tests pass.
- [x] Add focused automated coverage for critical customer flows and verify the full test suite.
- [x] Split vendor chunks with Vite manual chunking for the mobile performance target; existing lint warnings are non-blocking.
- [x] Add admin appointment operations with status management.
- [x] Integrate Ameex Sandbox parcel creation, tracking persistence, and signed status webhook handling.
- [x] Add explicit, feature-flagged Ameex dispatch controls and responsive wishlist drawer actions without bag-drawer stacking.

## Next Planned Sprint: Footer, Brand Experience & Maison Discoverability

The existing footer component is present, but its navigation anchors currently use placeholder `#` targets, the International strip is not a required storefront destination, and the social icons are generic rather than admin-configurable. The following work is intentionally planned but not yet implemented:

- [ ] Build routed footer content pages for Boutique Concierge, Find a Boutique, Contact Us, Delivery & Returns, Care Guide, Book an Appointment, Our Story, Craftsmanship, Careers, Privacy Policy, Cookies Policy, Terms, and Modern Slavery Act.
- [ ] Replace every footer placeholder link with verified route links and add navigation/link tests so each destination resolves correctly on desktop and mobile.
- [ ] Remove the International footer section and any related copy from the storefront.
- [ ] Replace generic footer social icons with Instagram, TikTok, and WhatsApp icons using `lucide-react` or approved brand-safe icon assets, with accessible labels and touch targets.
- [ ] Add admin-managed social link configuration (Instagram, TikTok, WhatsApp URL/phone) persisted through the white-label site configuration and reflected immediately in the footer.
- [ ] Add a Find a Boutique page with an embedded Google Map, configurable map embed URL/location, address, coordinates, and directions link; provide an admin setting for changing the active boutique location without code changes.
- [ ] Define the Google Maps integration boundary: prefer an embeddable map URL or Maps Embed configuration, document any API key/referrer restrictions, and keep credentials out of source control.
- [ ] Add a global branded loading screen that displays the current configurable website/maison name and updates when the admin changes `site_name`; cover initial app boot and route/data loading transitions without trapping keyboard or screen-reader users.
- [ ] Add responsive footer QA for accordion behavior, safe touch targets, keyboard focus, contrast, and social/map links across mobile and desktop breakpoints.
- [ ] Add an admin preview/validation workflow for footer copy, social URLs, contact details, and boutique map settings before publishing.
- [ ] Add localized FR/EN copy for all new pages, footer labels, careers content, legal pages, map directions, and loading-screen text.
- [ ] Add SEO metadata, canonical routes, and appropriate noindex/legal handling for informational, careers, and policy pages.