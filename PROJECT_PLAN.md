# Master Blueprint: White-Label Luxury Jewelry Platform

- [x] Step 0: Repository Scaffolding & Base Supabase Client Setup
- [ ] Step 1: Enterprise Database Architecture (SQL Migrations for Config, RBAC, Taxonomy, Products, Reviews & Enquiries)
- [x] Step 2: Global State & Dynamic Theme Engine (`useSiteConfig` with Dual Light/Dark Luxury CSS Variables)
- [x] Step 3: Minimalist Chopard-Inspired Header, Navigation & Dynamic Brand Switcher
- [x] Step 4: High-Impact Hero Banner & Storytelling Collections Carousel
- [x] Step 5: Advanced Jewelry Catalog (Chopard card precision: subtitle-to-button hover swap, NEW badges, dash/dot carousel indicators, arrow timer resets, image zoom)
- [x] Step 6: Dedicated Product Detail Page (`/product/:id`) with high-res gallery, specs, boutique concierge CTA, and approved customer reviews
- [x] Step 6a: YOU MAY ALSO LIKE recommendation engine
- [ ] Step 7: Customer Interaction Layer (Submit Review Modal, Contact Us Form & Concierge Drawer)
- [ ] Step 8: Supabase Auth Engine (Customer Sign Up/Log In & Admin Protected Route Guards)
- [ ] Step 9: Enterprise Admin Dashboard (Manage Site Config, Themes, Taxonomy, Products, Reviews Moderation & Enquiries)

## Catalog Architecture

- **Admin Product Attributes & Taxonomy System**: Define database entities for `Attributes` and `AttributeValues`. Configure Admin Product Creation forms to query these taxonomies as standardized dropdowns for Category, Metal, Gender, Shape, and Novelty rather than manual text entry, keeping storefront drawer facets synchronized automatically.