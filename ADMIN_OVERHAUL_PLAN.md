# Admin Dashboard Overhaul & Security Plan

> **Copilot Instructions:** Complete these phases sequentially. Tackle **1 Phase per prompt**. Mark items `[x]` as they pass verification tests.

---

## Phase 1: Security Guard & Inventory Table Operations
*Goal: Secure `/admin` against unauthorized access, add multi-attribute search, responsive pagination, and bulk tag management.*

- [x] **1.1 Admin Security Route Guard (`src/components/AdminGuard.jsx`)**
  - Intercept unauthorized access to `/admin`.
  - Redirect unauthenticated users to `/login`.
  - Redirect authenticated non-admin users to `/` home page with a localized warning toast.

- [x] **1.2 Inventory Table Search & Responsive Filters (`src/components/AdminProductTable.jsx`)**
  - Add search bar filtering across title, SKU, category, and specifications.
  - Implement dynamic status/category filter dropdowns.
  - Mobile view: Collapse filters into an accordion/drawer while keeping the search bar pinned.

- [x] **1.3 Pagination & Rows Per Page Control (`src/components/AdminProductTable.jsx`)**
  - Add pagination controls with options: `5`, `10`, `20`, `50`, `All` rows per page.
  - Persist current page and limit in state or query parameters.

- [x] **1.4 Multi-Select Bulk Actions (`src/components/AdminProductTable.jsx`)**
  - Add selection checkboxes to table rows and a "Select All" header checkbox.
  - Render a top floating action bar when items are selected (*"Apply Tag"*, *"Clear Tag"*, *"Delete Selected"*).

---

## Phase 2: Dynamic Taxonomies & Global Filter Integration
*Goal: Allow instant creation of Categories, Collections, and Tags that feed dynamically into website filters.*

- [x] **2.1 Dynamic Category & Collection Selectors (`src/components/TaxonomyInput.jsx`)**
  - Build combobox inputs for Category and Collection fields with an inline **+ Create New** button.
  - Persist newly created categories to the backend database taxonomy table.

- [x] **2.2 Tag Management Engine (`src/components/TagManager.jsx`)**
  - Replace "Novelty" dropdown with a flexible **Tags** chip input system (*"New Arrival"*, *"Iconic"*, *"Boutique Exclusive"*).
  - Support multi-tag assignments per product.

- [x] **2.3 Catalog Filter Synchronization (`src/pages/Catalog.jsx`)**
  - Update frontend store catalog filters to dynamically query available categories and tags from database records.

---

## Phase 3: Split Full-Page Creation & Edit Workspace
*Goal: Replace the cramped modal with a dedicated split-screen editing studio and dynamic specification management.*

- [x] **3.1 Full-Page Editor Route (`src/pages/AdminProductEditor.jsx`)**
  - Add route `/admin/inventory/editor` (handles both `/new` and `/edit/:id`).
  - Desktop: 60% Left column form space, 40% Right column live preview frame.
  - Mobile: Sticky top tab switcher `[ EDIT FORM ]` and `[ LIVE PREVIEW ]`.

- [x] **3.2 Dynamic Key-Value Specifications Table (`src/components/SpecificationEditor.jsx`)**
  - Replace static Metal selector with a dynamic 2-column key-value table (`Key` | `Value`).
  - Add **+ Add Specification** button to create arbitrary attributes (*"Metal"*, *"Carat Weight"*, *"Gemstone"*).
  - Render specs inside the live product preview accordion.

- [ ] **3.3 Real-Time Live Preview Frame (`src/components/AdminProductPreview.jsx`)**
  - Render a live Maison product card and detail panel reflecting left-form state in real-time.
  - Include a manual **Refresh Preview** fallback button.

---

## Phase 4: Markdown Description Toolbar & Image Reordering
*Goal: Add rich text description formatting and drag-and-drop photo management.*

- [ ] **4.1 Markdown Description Toolbar (`src/components/MarkdownToolbar.jsx`)**
  - Mount formatting toolbar above description input: `Heading`, `Bold`, `Italic`, `Link`, `Blockquote`, `Numbered List`, `Bulleted List`, `Horizontal Rule`.
  - Format selected text or insert Markdown tags at the cursor position.

- [ ] **4.2 Drag-and-Drop Image Reordering Canvas (`src/components/ImageUploader.jsx`)**
  - Create dropzone accepting file drops, local browsing, and direct URL strings.
  - Implement pointer drag-to-swap reordering for thumbnail cards with highlight drop indicators.
  - Highlight position `0` as **[ COVER IMAGE ]**.