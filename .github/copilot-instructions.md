# Architectural Rules & System Vision ($5k Luxury Standard)

## Project Vision
We are engineering a high-end, bespoke e-commerce platform tailored specifically for fine jewelry, inspired by Chopard's visual-first luxury aesthetic. 
The platform must operate as a fully customizable White-Label engine capable of instant rebranding (logos, dark/light mode themes, copy, and contact info) via an Admin Dashboard.

## Core Architectural Requirements
1. **Dynamic Design Tokens**: Support dual color schemes (Bright/Dark luxury palettes). Store CSS variable tokens (background, primary text, gold accents, border colors) in Supabase `site_config`.
2. **Deep Taxonomy**: Products must support multi-level relations: Collections (e.g., Ice Cube), Categories (e.g., Rings, Bracelets), and Tags (e.g., 18k White Gold, Solitaire, Anniversary).
3. **Role-Based Auth (RBAC)**: Enforce public access for storefront operations and strict authenticated Admin access for CRUD management.
4. **Editorial Luxury Aesthetic**: Focus on image-dominant displays, subtle hover transitions, fluid typography (Cinzel/Playfair or refined serif headers with modern sans-serif body), generous whitespace, and minimal UI clutter.
5. **Iconography**: Use `lucide-react` for all UI icons (e.g., `ShoppingBag`, `Search`, `User`, `Sun`, `Moon`, `Menu`, `X`, `Check`, `Star`, `MessageSquare`). Maintain delicate stroke widths (`strokeWidth={1.25}` or `1.5`) for a luxury serif/editorial feel.