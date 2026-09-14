# FEATURE SPECIFICATION: Luxury Concierge Chat & Multi-Operator Realtime Platform

## Architecture Overview & Stack Context
- **Frontend Stack**: React, Vite, Tailwind CSS, Lucide Icons.
- **Backend Infrastructure**: Supabase (Database, Auth, Realtime, Edge Functions).
- **Primary Goals**:
  1. Provide a floating, non-intrusive luxury chat widget for high-end boutique customers.
  2. Maintain automated triage chips to protect staff workload before routing to human operators.
  3. Furnish a multi-operator admin board with collision detection and a Live Context Inspector (cart contents, active page, total value).
  4. Enable Live Remote Cart Sync allowing operators to push cart updates or bespoke checkout links directly into the customer's active session via Supabase Realtime.
  5. Provide a hybrid persistence model: local storage for guest sessions, server persistence on active checkout/identification, and auto-cleanup (TTL) for abandoned chats.

---

## Technical Dependencies & Setup Requirements
- Supabase Realtime enabled on tables: `chat_sessions`, `chat_messages`.
- Supabase Realtime Broadcast & Presence channels for operator typing, collision locks, and live cart sync.
- Web Audio API for soft luxury sound triggers on admin notifications.

---

## Step-by-Step Phased Execution Plan

Phase 1: DB & Realtime Schema -> Phase 2: Customer Widget -> Phase 3: Context Engine -> Phase 4: Operator Dashboard -> Phase 5: Live Cart Sync Engine -> Phase 6: Notifications & TTL

---

### Phase 1: Database Migration & Security Policies

#### Task 1.1: Database Schema Migration (`supabase/migrations/20260915000001_concierge_chat.sql`)
Create the core schema tables for chat management:

```sql
-- 1. CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    guest_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('unassigned', 'assigned', 'resolved')) DEFAULT 'unassigned',
    assigned_operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    page_context JSONB DEFAULT '{}'::jsonb, -- { url, active_step, cart_items, total_value }
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'operator', 'system', 'bot')),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    product_card JSONB DEFAULT NULL, -- { id, title, price, image, url }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR REALTIME & QUEUE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON public.chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message ON public.chat_sessions(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);

-- ENABLE REPLICA IDENTITY FOR REALTIME BROADCAST
ALTER TABLE public.chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
```

#### Task 1.2: Row Level Security Policies
- **Customers**: Can read/write messages belonging to their own `guest_token` or `customer_id`.
- **Staff/Managers/Super Admins**: Can read/write all `chat_sessions` and `chat_messages` if permissions check `can_manage_orders = true` or `role IN ('Manager', 'Super Admin')`.

---

### Phase 2: Customer Floating Widget & Automated Triage Engine

#### Task 2.1: Floating Panel Component (`src/components/chat/ConciergeWidget.jsx`)
- **Anchor**: Fixed viewport positioning (`bottom: 24px`, `right: 24px`, `z-index: 50`).
- **Styling**: Dark luxury aesthetics (`bg-neutral-900/95`, `border-amber-500/30`, gold accents).
- **Triggers**:
  - Checkout page (`/checkout`): 10-second idle trigger showing ripple animation and discrete pill: *"Besoin d'assistance pour valider votre commande ?"*
  - Product page (`/product/*`): 20-second idle trigger with pill: *"Une question sur la taille ou le sertissage ?"*
- **Panel Mechanics**:
  - Smooth slide-up transition (300ms ease-out).
  - Outside-click dismissal with state saved to `localStorage` (`diamiss_chat_guest_token`).
  - Header displays green presence dot (**En ligne**), title **Concierge Diamiss**, subtitle *"Réponse habituelle en < 3 min"*, close button, and a WhatsApp fallback icon.

#### Task 2.2: Automated Triage & Chip Selector
When a new conversation initializes, display 3 automated prompt chips prior to human routing:
1. 📦 **Livraison & Délais** *(Auto-reply: Secure hand-delivery in Casablanca/Rabat & fully insured national courier shipping).*
2. 💎 **Certificats & Sur-Mesure** *(Auto-reply: GIA/HRD certificate guarantees and custom sizing details).*
3. 👤 **Parler à un conseiller** *(Routes to human operator queue).*

#### Task 2.3: Offline & Timeout Fallbacks
- If no operator accepts within 45 seconds or during off-hours, append system message:
  *"Nos conseillers sont actuellement occupés. Laissez votre numéro WhatsApp ou email pour un suivi prioritaire sous 15 minutes."*

---

### Phase 3: Realtime Live Context Engine

#### Task 3.1: Context Collector (`src/utils/chatContextCollector.js`)
- Continuously aggregate customer state and write to `chat_sessions.page_context` on page/cart changes:
  - Current URL path.
  - Active checkout step (e.g. Shipping / Payment).
  - Active cart items (Product title, metal variant, ring size, metal choice).
  - Calculated total cart value (in MAD).
- Debounce database updates to maximum once every 3 seconds to avoid unnecessary DB load.

---

### Phase 4: Multi-Operator Dashboard & Collision Engine

#### Task 4.1: Queue Board (`src/components/admin/concierge/ConciergeBoard.jsx`)
Create a 4-column operational layout inside `Admin.jsx`:

- **En Attente (Unassigned)**: `status = 'unassigned'` (Sorted by cart value; High-value checkout carts pinned to top with amber glow).
- **Mes Conversations**: `status = 'assigned' AND assigned_operator_id = currentUser.id` (Operator's active chat list).
- **Nécessite Attention**: Has unread customer message in active assigned chat (Pulsing alert badge for quick operator response).
- **Résolues**: `status = 'resolved'` (Archived past 24 hours).

#### Task 4.2: Collision Prevention Engine
- Implement Supabase Realtime Presence channel (`room: concierges`).
- When Operator A opens an unassigned chat, broadcast `operator_viewing` event.
- Display *"Manager [Name] consulte cette session..."* on Operator B's view, disabling the **Claim Chat** action to prevent dual-reply collisions.

#### Task 4.3: Live Context Inspector (`src/components/admin/concierge/ContextInspector.jsx`)
Sidebar accompanying active chat showing:
- Active page URL badge.
- Current cart contents: Item list, selected metal choices, ring sizes, and total order value.
- **Quick Action Triggers**:
  - "Push Product Card" (Opens inventory selector to inject product card directly into chat).
  - "Push Canned Response" (`/livraison`, `/taille`, `/certificat`).
  - "Sync Remote Cart".

---

### Phase 5: Live Remote Cart Sync & Quick Actions

#### Task 5.1: Realtime Remote Cart Synchronization
- **Operator Action**: Operator adjusts an item quantity, adds a bespoke product option, or applies an agreed discount code in the Inspector panel and clicks **"Sync to Customer's Cart"**.
- **Broadcast Event**: Pushes event `remote_cart_update` over channel `chat_session_${id}`.
- **Customer Frontend Listener**: Customer widget receives payload and updates local shopping cart state in real time using smooth toast UI: *"Votre conseiller a mis à jour votre panier."*

---

### Phase 6: Audio Notifications & Maintenance TTL

#### Task 6.1: High-Priority Audio & Tab Title Flasher
- Play a discrete luxury chime using Web Audio API when a new high-value checkout session enters the `Unassigned` queue.
- Flash tab title: `(1) Nouveau Message Concierge - Diamiss Admin`.

#### Task 6.2: Cleanup Scheduled Task (Database Function)
- Create a cron migration to purge guest sessions without activity after 7 days:

```sql
DELETE FROM public.chat_sessions
WHERE customer_id IS NULL 
  AND status = 'resolved'
  AND updated_at < NOW() - INTERVAL '7 days';
```

---

## Incremental Validation Checks for Agent Execution
1. **Lint Verification**: `npm.cmd run lint`
2. **Test Suite Verification**: `npm.cmd run test`
3. **Build Target Check**: `npm.cmd run build`



Note the writer of this file might not have full context so some variable names might not be written the way they are actually are in the project.