# Design System 100-Cycle Implementation Plan

**Version:** 1.0.0
**Created:** 2025-11-22
**Status:** Planning
**Goal:** Implement the 6-token design system across all 279 ontology-ui components, 113 pages, and 9 layouts

## Overview

This plan implements the beautifully simple design system from `/design` across the entire codebase:

**The 6 Tokens:**
- `background` - Card surface (light: 0 0% 93%, dark: 0 0% 10%)
- `foreground` - Content area inside cards (light: 0 0% 100%, dark: 0 0% 13%)
- `font` - Text color (light: 0 0% 13%, dark: 0 0% 100%)
- `primary` - Main CTA (216 55% 25%)
- `secondary` - Supporting actions (219 14% 28%)
- `tertiary` - Accent actions (105 22% 25%)

**The 4 Properties:**
- **States:** hover (opacity-90, scale-[1.02]), active (opacity-80, scale-[0.98]), focus (ring-2), disabled (opacity-50)
- **Elevation:** shadow-sm (cards), shadow-md (dropdowns), shadow-lg (buttons), shadow-xl (hover), shadow-2xl (modals)
- **Radius:** sm (6px), md (8px - default), lg (12px), xl (16px), full (circular)
- **Motion:** fast (150ms), normal (300ms), slow (500ms), easing (ease-in-out)

**Key Principles:**
1. Cards use `background` (frame) + `foreground` (content area)
2. Buttons use `primary/secondary/tertiary` for brand colors
3. 3 colors adapt (background, foreground, font) for dark mode
4. 3 colors stay constant (primary, secondary, tertiary)
5. Things can override all 6 colors for per-thing branding

---

## Phase 1: Foundation (Cycles 1-10)

### Cycle 1: Audit Current State
**Goal:** Document all current color token usage and hardcoded colors
**Tasks:**
- Grep all components for hardcoded HSL colors
- Grep for old shadcn tokens (card, popover, accent, muted, destructive, etc.)
- Create audit report of token usage across all 279 components
- Identify components already using new 6-token system
- Document breaking changes needed

**Output:** `one/events/design-system-audit.md`

### Cycle 2: Update Global CSS
**Goal:** Replace all old tokens with 6-token system
**Tasks:**
- Remove old shadcn tokens from `global.css`
- Keep only 6 core tokens + auto-generated variants
- Add dark mode overrides for adaptive tokens (background, foreground, font)
- Generate all variants (primary-light, primary-dark, etc.)
- Add CSS comments documenting token purpose

**Files:** `web/src/styles/global.css`

### Cycle 3: Update Tailwind Config
**Goal:** Ensure Tailwind theme extends 6 tokens
**Tasks:**
- Update `tailwind.config.js` to reference new tokens
- Remove old token references
- Add typography scale configuration
- Add spacing scale configuration
- Test that all tokens resolve correctly

**Files:** `web/tailwind.config.js`

### Cycle 4: Create Design System Primitives
**Goal:** Build reusable primitive components
**Tasks:**
- Create `ColorSwatch` component (shows token with value)
- Create `StateDemo` component (shows hover/active/focus/disabled)
- Create `ElevationDemo` component (shows shadow levels)
- Create `RadiusDemo` component (shows radius options)
- Create `MotionDemo` component (shows timing functions)

**Files:** `web/src/components/design/primitives/`

### Cycle 5: Update Button Component (Core)
**Goal:** Make Button the canonical example of design system
**Tasks:**
- Implement exact button states from `/design` page
- Primary variant: `bg-[hsl(216_55%_25%)]`, hover: `bg-[hsl(216_55%_20%)]`, shadow-lg → shadow-xl
- Secondary variant: `bg-[hsl(219_14%_28%)]`, same state pattern
- Tertiary variant: `bg-[hsl(105_22%_25%)]`, same state pattern
- Outline: border-2 + transparent bg + hover:bg-primary/10
- Ghost: transparent + hover:bg-font/10
- All states: hover (150ms, scale-[1.02], shadow increase), active (scale-[0.98], shadow decrease), focus (ring-2 ring-primary ring-offset-2), disabled (opacity-50, cursor-not-allowed)

**Files:** `web/src/components/ui/button.tsx`

### Cycle 6: Update Card Component (Core)
**Goal:** Implement explicit background/foreground pattern
**Tasks:**
- Card wrapper uses `bg-background` (gray frame)
- CardContent uses `bg-foreground` (white content area)
- CardHeader, CardFooter use `bg-foreground`
- Default elevation: shadow-sm
- Default radius: rounded-md
- Add `className` prop for overrides
- Update all card examples to show frame + content pattern

**Files:** `web/src/components/ui/card.tsx`

### Cycle 7: Update Form Components (Input, Select, Textarea)
**Goal:** Consistent form styling with 6 tokens
**Tasks:**
- Input: bg-foreground, border-font/20, focus:ring-2 ring-primary
- Select: Same as input
- Textarea: Same as input
- Checkbox: border-font/20, checked:bg-primary
- Radio: Same as checkbox
- Label: text-font, font-medium
- All states: focus (ring-2), disabled (opacity-50, cursor-not-allowed)

**Files:** `web/src/components/ui/input.tsx`, `select.tsx`, `textarea.tsx`, `checkbox.tsx`, `radio.tsx`, `label.tsx`

### Cycle 8: Update Badge Component
**Goal:** Badge variants using 6 tokens
**Tasks:**
- Default: bg-background, text-font
- Primary: bg-primary/10, text-primary
- Secondary: bg-secondary/10, text-secondary
- Tertiary: bg-tertiary/10, text-tertiary
- Outline: border-font/20, bg-transparent
- Radius: rounded-sm (6px)

**Files:** `web/src/components/ui/badge.tsx`

### Cycle 9: Update Dialog/Modal Components
**Goal:** Consistent overlay styling
**Tasks:**
- DialogOverlay: bg-background/80, backdrop-blur-sm
- DialogContent: bg-foreground, shadow-2xl, rounded-lg
- DialogHeader, DialogFooter: border-font/10
- DialogTitle: text-font, font-semibold
- DialogDescription: text-font/60
- Close button: hover:bg-font/10, focus:ring-2 ring-primary

**Files:** `web/src/components/ui/dialog.tsx`, `modal.tsx`, `sheet.tsx`

### Cycle 10: Create Migration Guide & Examples
**Goal:** Document how to migrate components
**Tasks:**
- Create before/after examples for each component type
- Document common patterns (cards, buttons, forms)
- Create interactive examples in Storybook or demo page
- Write migration checklist
- Document breaking changes

**Files:** `one/knowledge/design-system-migration-guide.md`

---

## Phase 2: Core UI Components (Cycles 11-20)

### Cycle 11: Update Alert Component
**Goal:** Alert variants using design system
**Tasks:**
- Default: bg-background, border-font/20
- Info: bg-primary/10, border-primary/30
- Success: bg-tertiary/10, border-tertiary/30
- Warning: bg-[hsl(30_100%_50%/0.1)], border-[hsl(30_100%_50%/0.3)]
- Error: bg-destructive/10, border-destructive/30
- Icons use matching colors

**Files:** `web/src/components/ui/alert.tsx`

### Cycle 12: Update Dropdown/Popover Components
**Goal:** Consistent elevation and styling
**Tasks:**
- DropdownContent: bg-foreground, shadow-lg, rounded-md, border-font/10
- DropdownItem: hover:bg-background, focus:bg-background
- DropdownSeparator: bg-font/10
- Popover: Same pattern as dropdown
- Context menu: Same pattern

**Files:** `web/src/components/ui/dropdown-menu.tsx`, `popover.tsx`, `context-menu.tsx`

### Cycle 13: Update Tooltip Component
**Goal:** Clean, accessible tooltips
**Tasks:**
- TooltipContent: bg-font, text-background, shadow-md, rounded-sm
- Small text (text-xs)
- Arrow matches background
- Animate in/out with motion tokens (150ms)

**Files:** `web/src/components/ui/tooltip.tsx`

### Cycle 14: Update Tabs Component
**Goal:** Clean tab navigation
**Tasks:**
- TabsList: bg-background, rounded-md, p-1
- TabsTrigger: hover:bg-foreground, selected:bg-foreground, text-font
- Smooth transition (300ms)
- Focus: ring-2 ring-primary

**Files:** `web/src/components/ui/tabs.tsx`

### Cycle 15: Update Accordion Component
**Goal:** Consistent expandable sections
**Tasks:**
- AccordionItem: border-b border-font/10
- AccordionTrigger: hover:bg-background, text-font
- AccordionContent: text-font/80, animate-in (300ms)
- Icon rotates on expand

**Files:** `web/src/components/ui/accordion.tsx`

### Cycle 16: Update Table Component
**Goal:** Clean data tables
**Tasks:**
- Table: border-font/10
- TableHeader: bg-background, text-font, font-semibold
- TableRow: hover:bg-background, border-b border-font/10
- TableCell: text-font/80
- Responsive on mobile

**Files:** `web/src/components/ui/table.tsx`

### Cycle 17: Update Progress/Slider Components
**Goal:** Interactive controls with brand colors
**Tasks:**
- Progress: bg-background, fill:bg-primary
- Slider: track:bg-background, thumb:bg-primary, focus:ring-2 ring-primary
- Animate fill (300ms)

**Files:** `web/src/components/ui/progress.tsx`, `slider.tsx`

### Cycle 18: Update Calendar/Date Picker
**Goal:** Clean date selection
**Tasks:**
- Calendar: bg-foreground, rounded-md, shadow-lg
- Day buttons: hover:bg-background, selected:bg-primary, text-white
- Month/year selects use form component styles
- Focus states on keyboard navigation

**Files:** `web/src/components/ui/calendar.tsx`, `date-picker.tsx`

### Cycle 19: Update Command/Combobox
**Goal:** Clean command palette
**Tasks:**
- CommandDialog: Same as Dialog
- CommandInput: Same as Input
- CommandList: bg-foreground
- CommandItem: hover:bg-background, selected:bg-background
- CommandGroup: text-font/60, font-semibold, uppercase

**Files:** `web/src/components/ui/command.tsx`, `combobox.tsx`

### Cycle 20: Update Navigation Components
**Goal:** Clean navigation patterns
**Tasks:**
- NavigationMenu: bg-background
- NavigationMenuItem: hover:bg-foreground, text-font
- NavigationLink: active:bg-foreground, focus:ring-2 ring-primary
- Breadcrumbs: text-font/60, separator:text-font/40
- Pagination: Same button styles

**Files:** `web/src/components/ui/navigation-menu.tsx`, `breadcrumb.tsx`, `pagination.tsx`

---

## Phase 3: Ontology Components - Groups (Cycles 21-25)

### Cycle 21: GroupCard Component
**Goal:** Showcase card pattern with groups
**Tasks:**
- Outer card: bg-background, p-1, shadow-sm, rounded-md
- Inner content: bg-foreground, p-4, rounded-md
- Title: text-font, font-semibold
- Description: text-font/80
- Actions use primary/secondary buttons

**Files:** `web/src/components/ontology-ui/groups/GroupCard.tsx`

### Cycle 22: GroupList Component
**Goal:** List of groups with consistent styling
**Tasks:**
- Container: bg-foreground, rounded-md, shadow-sm
- List items: hover:bg-background, border-b border-font/10
- Group name: text-font, font-medium
- Member count: text-font/60
- Actions: ghost buttons

**Files:** `web/src/components/ontology-ui/groups/GroupList.tsx`

### Cycle 23: GroupCreator Component
**Goal:** Form for creating groups
**Tasks:**
- Dialog pattern with design system
- Form inputs use updated styles
- Submit button: primary variant
- Cancel button: ghost variant
- Validation states use tertiary for success, destructive for errors

**Files:** `web/src/components/ontology-ui/groups/GroupCreator.tsx`

### Cycle 24: GroupHierarchy Component
**Goal:** Visual group tree
**Tasks:**
- Tree nodes: hover:bg-background
- Expand/collapse: smooth animation (300ms)
- Indent with consistent spacing (space-4)
- Active group: bg-primary/10, border-l-2 border-primary

**Files:** `web/src/components/ontology-ui/groups/GroupHierarchy.tsx`

### Cycle 25: Remaining Groups Components (11 components)
**Goal:** Apply design system to all group components
**Tasks:**
- GroupSelector, GroupViewer, GroupSettings, GroupMembers, GroupInvite, GroupRoles, GroupPermissions, GroupActivity, GroupStats, GroupExplorer, GroupBreadcrumbs
- Each uses card/button/form patterns from design system
- Consistent elevation, radius, motion
- Test dark mode for all

**Files:** `web/src/components/ontology-ui/groups/*.tsx`

---

## Phase 4: Ontology Components - People (Cycles 26-30)

### Cycle 26: PersonCard Component
**Goal:** Person cards with design system
**Tasks:**
- Card pattern: background + foreground
- Avatar: rounded-full, border-2 border-font/20
- Name: text-font, font-semibold
- Role badge: use badge component
- Actions: primary/secondary buttons

**Files:** `web/src/components/ontology-ui/people/PersonCard.tsx`

### Cycle 27: PersonList Component
**Goal:** List of people
**Tasks:**
- Table pattern with design system
- Avatar thumbnails
- Sortable columns: hover states
- Filters use form components
- Pagination uses updated component

**Files:** `web/src/components/ontology-ui/people/PersonList.tsx`

### Cycle 28: PersonProfile Component
**Goal:** Full person profile view
**Tasks:**
- Multiple cards for sections (bio, connections, activity)
- Tabs for different views
- Edit mode uses form components
- Save button: primary, Cancel: ghost

**Files:** `web/src/components/ontology-ui/people/PersonProfile.tsx`

### Cycle 29: PersonSelector Component
**Goal:** Pick people from list
**Tasks:**
- Combobox pattern with design system
- Search input uses updated input component
- Results list: hover:bg-background
- Selected people: badges with remove button

**Files:** `web/src/components/ontology-ui/people/PersonSelector.tsx`

### Cycle 30: Remaining People Components (11 components)
**Goal:** Apply design system to all people components
**Tasks:**
- PersonViewer, PersonCreator, PersonEditor, PersonInvite, PersonRoles, PersonPermissions, PersonActivity, PersonConnections, PersonStats, PersonSettings, PersonAvatar
- Consistent patterns across all
- Test thing-level color overrides

**Files:** `web/src/components/ontology-ui/people/*.tsx`

---

## Phase 5: Ontology Components - Things (Cycles 31-40)

### Cycle 31: ThingCard Component
**Goal:** Universal thing card
**Tasks:**
- Use ThingCard wrapper from design system implementation
- Support thing-level color overrides
- Type badge shows thing type
- Properties displayed in clean grid
- Actions adapt based on thing type

**Files:** `web/src/components/ontology-ui/things/ThingCard.tsx`

### Cycle 32: ThingList Component
**Goal:** Filterable thing list
**Tasks:**
- Grid or list view toggle
- Filter sidebar uses form components
- Sort controls use select component
- Pagination
- Empty state with illustration

**Files:** `web/src/components/ontology-ui/things/ThingList.tsx`

### Cycle 33: ThingCreator Component
**Goal:** Create any thing type
**Tasks:**
- Multi-step form with progress indicator
- Type selector uses radio or select
- Dynamic form based on thing type
- Color picker for thing-level branding (optional)
- Preview panel shows live rendering

**Files:** `web/src/components/ontology-ui/things/ThingCreator.tsx`

### Cycle 34: ThingViewer Component
**Goal:** View thing details
**Tasks:**
- Tabbed interface (details, connections, events, knowledge)
- Each tab uses card layouts
- Action menu uses dropdown component
- Share dialog uses updated dialog

**Files:** `web/src/components/ontology-ui/things/ThingViewer.tsx`

### Cycle 35: ThingEditor Component
**Goal:** Edit thing properties
**Tasks:**
- Form with validation
- Preview mode vs edit mode toggle
- Auto-save indicator
- Unsaved changes warning (dialog)
- Submit: primary button

**Files:** `web/src/components/ontology-ui/things/ThingEditor.tsx`

### Cycle 36: Thing Type Components (5 components)
**Goal:** Specific thing type cards
**Tasks:**
- ProductCard, CourseCard, TokenCard, AgentCard, ContentCard
- Each showcases thing-level branding
- Type-specific properties highlighted
- Type-specific actions

**Files:** `web/src/components/ontology-ui/things/*Card.tsx`

### Cycle 37: Thing Property Components (5 components)
**Goal:** Display thing properties
**Tasks:**
- PropertyList, PropertyEditor, PropertyViewer, PropertyValidator, PropertyHistory
- Clean key-value display
- Editable inline with form components
- Type-aware rendering (string, number, date, etc.)

**Files:** `web/src/components/ontology-ui/things/property/*.tsx`

### Cycle 38: Thing Search & Filter (3 components)
**Goal:** Search and filter things
**Tasks:**
- ThingSearch (command palette pattern)
- ThingFilter (sidebar with form components)
- ThingSort (dropdown with options)
- Keyboard shortcuts

**Files:** `web/src/components/ontology-ui/things/search/*.tsx`

### Cycle 39: Thing Actions (3 components)
**Goal:** Common thing actions
**Tasks:**
- ThingActions (dropdown menu with icons)
- ThingShare (dialog with copy link)
- ThingDelete (confirmation dialog)
- Toast notifications for feedback

**Files:** `web/src/components/ontology-ui/things/actions/*.tsx`

### Cycle 40: Remaining Things Components (4 components)
**Goal:** Complete thing components
**Tasks:**
- ThingStats, ThingTimeline, ThingRelated, ThingEmbed
- Use chart components for stats
- Timeline uses clean list pattern
- Related items in grid
- Embed code in syntax-highlighted box

**Files:** `web/src/components/ontology-ui/things/*.tsx`

---

## Phase 6: Ontology Components - Connections (Cycles 41-45)

### Cycle 41: ConnectionCard Component
**Goal:** Show relationships between things
**Tasks:**
- Two things connected with arrow/line
- Connection type badge
- Metadata (created date, strength)
- Actions to break/edit connection

**Files:** `web/src/components/ontology-ui/connections/ConnectionCard.tsx`

### Cycle 42: ConnectionList Component
**Goal:** List all connections for a thing
**Tasks:**
- Grouped by connection type
- Filter by type, direction (to/from)
- Sort by date, strength
- Visual indicators for direction

**Files:** `web/src/components/ontology-ui/connections/ConnectionList.tsx`

### Cycle 43: ConnectionCreator Component
**Goal:** Create connections
**Tasks:**
- Select connection type (dropdown)
- Pick from/to things (combobox)
- Set metadata (form)
- Preview before creating

**Files:** `web/src/components/ontology-ui/connections/ConnectionCreator.tsx`

### Cycle 44: ConnectionGraph/Tree (3 components)
**Goal:** Visual relationship mapping
**Tasks:**
- ConnectionGraph (network view with D3/vis.js)
- ConnectionTree (hierarchical tree)
- RelationshipTree (existing component update)
- Interactive nodes (hover, click)
- Zoom and pan controls

**Files:** `web/src/components/ontology-ui/connections/graph/*.tsx`

### Cycle 45: Remaining Connections Components (6 components)
**Goal:** Complete connection components
**Tasks:**
- ConnectionViewer, ConnectionEditor, ConnectionFilter, ConnectionStats, ConnectionTimeline, RelationshipViewer
- Consistent with design system
- Interactive visualizations
- Export options

**Files:** `web/src/components/ontology-ui/connections/*.tsx`

---

## Phase 7: Ontology Components - Events (Cycles 46-50)

### Cycle 46: EventCard Component
**Goal:** Display event details
**Tasks:**
- Timestamp with relative time (2h ago)
- Event type badge with icon
- Actor (person) + action + target (thing)
- Expandable details section

**Files:** `web/src/components/ontology-ui/events/EventCard.tsx`

### Cycle 47: EventList/Timeline Component
**Goal:** Chronological event display
**Tasks:**
- Infinite scroll with virtual list
- Group by date (today, yesterday, last week)
- Filter by event type, actor, target
- Real-time updates with animations

**Files:** `web/src/components/ontology-ui/events/EventList.tsx`, `EventTimeline.tsx`

### Cycle 48: EventViewer Component
**Goal:** Detailed event view
**Tasks:**
- Full event payload in formatted JSON
- Related events section
- Actor and target links
- Metadata (IP, user agent, etc.) if available

**Files:** `web/src/components/ontology-ui/events/EventViewer.tsx`

### Cycle 49: EventFilter/Search (3 components)
**Goal:** Find specific events
**Tasks:**
- EventFilter (sidebar with date range, types, actors)
- EventSearch (full-text search)
- EventExport (download as JSON/CSV)
- Saved filters

**Files:** `web/src/components/ontology-ui/events/filter/*.tsx`

### Cycle 50: Remaining Events Components (7 components)
**Goal:** Complete event components
**Tasks:**
- EventStats, EventChart, EventHeatmap, EventLog, EventSubscribe, EventNotification, EventWebhook
- Charts use consistent colors
- Notifications use toast/alert components
- Webhooks use form components

**Files:** `web/src/components/ontology-ui/events/*.tsx`

---

## Phase 8: Ontology Components - Knowledge (Cycles 51-55)

### Cycle 51: KnowledgeCard Component
**Goal:** Display knowledge items (labels, vectors)
**Tasks:**
- Label display with color coding
- Vector similarity score
- Source thing/connection
- Edit/delete actions

**Files:** `web/src/components/ontology-ui/knowledge/KnowledgeCard.tsx`

### Cycle 52: KnowledgeSearch Component
**Goal:** Semantic search interface
**Tasks:**
- Search input with auto-complete
- Results with similarity scores
- Filter by knowledge type
- Sort by relevance, date

**Files:** `web/src/components/ontology-ui/knowledge/KnowledgeSearch.tsx`

### Cycle 53: KnowledgeViewer Component
**Goal:** View knowledge details
**Tasks:**
- Label hierarchy visualization
- Vector embeddings display
- Related knowledge items
- Usage statistics

**Files:** `web/src/components/ontology-ui/knowledge/KnowledgeViewer.tsx`

### Cycle 54: LabelManager Component
**Goal:** Manage labels and categories
**Tasks:**
- Create/edit/delete labels
- Hierarchical label tree
- Color picker for label colors
- Merge duplicate labels

**Files:** `web/src/components/ontology-ui/knowledge/LabelManager.tsx`

### Cycle 55: Remaining Knowledge Components (6 components)
**Goal:** Complete knowledge components
**Tasks:**
- KnowledgeCreator, KnowledgeEditor, KnowledgeGraph, KnowledgeStats, VectorViewer, RAGInterface
- Use design system throughout
- Interactive visualizations
- Export/import options

**Files:** `web/src/components/ontology-ui/knowledge/*.tsx`

---

## Phase 9: Crypto Components (Cycles 56-70)

**Note:** Crypto has 100 components, so we'll batch them by functionality

### Cycle 56-57: Crypto Wallet Components (15 components)
**Goal:** Wallet connection and management
**Tasks:**
- WalletConnect, WalletButton, WalletCard, WalletList, WalletBalance, WalletTransactions, WalletSend, WalletReceive, WalletSwap, WalletStake, WalletNFTs, WalletTokens, WalletHistory, WalletSettings, WalletExport
- Use primary button for connect
- Balance display with formatting
- Transaction list with status badges

**Files:** `web/src/components/ontology-ui/crypto/wallet/*.tsx`

### Cycle 58-59: Crypto Token Components (15 components)
**Goal:** Token display and management
**Tasks:**
- TokenCard, TokenList, TokenCreator, TokenViewer, TokenStats, TokenChart, TokenTransfer, TokenMint, TokenBurn, TokenApprove, TokenBalance, TokenPrice, TokenMarket, TokenSwap, TokenInfo
- Price charts with consistent colors
- Token icons/logos
- Transfer forms

**Files:** `web/src/components/ontology-ui/crypto/token/*.tsx`

### Cycle 60-61: Crypto NFT Components (15 components)
**Goal:** NFT display and management
**Tasks:**
- NFTCard, NFTGallery, NFTViewer, NFTCreator, NFTMinter, NFTTransfer, NFTMarketplace, NFTAuction, NFTBid, NFTOffer, NFTMetadata, NFTTraits, NFTHistory, NFTCollection, NFTExplorer
- Image/video display
- Trait filters
- Marketplace listings

**Files:** `web/src/components/ontology-ui/crypto/nft/*.tsx`

### Cycle 62-63: Crypto DeFi Components (15 components)
**Goal:** DeFi protocols integration
**Tasks:**
- LiquidityPool, Staking, Yield, Farming, Lending, Borrowing, Swap, Bridge, Vault, Strategy, Rewards, APY, TVL, Position, Portfolio
- APY/yield displays
- Pool composition charts
- Position management

**Files:** `web/src/components/ontology-ui/crypto/defi/*.tsx`

### Cycle 64-65: Crypto DAO Components (10 components)
**Goal:** DAO governance
**Tasks:**
- DAOCard, DAOList, Proposal, Vote, Delegate, Treasury, Member, Role, Quorum, Execution
- Voting interface
- Proposal timeline
- Quorum progress bars

**Files:** `web/src/components/ontology-ui/crypto/dao/*.tsx`

### Cycle 66-67: Crypto Transaction Components (10 components)
**Goal:** Transaction display and management
**Tasks:**
- TransactionCard, TransactionList, TransactionViewer, TransactionBuilder, TransactionSigner, TransactionHistory, TransactionStatus, TransactionReceipt, TransactionExplorer, GasEstimator
- Status badges (pending, confirmed, failed)
- Gas price selector
- Transaction timeline

**Files:** `web/src/components/ontology-ui/crypto/transaction/*.tsx`

### Cycle 68-69: Crypto Chain Components (10 components)
**Goal:** Blockchain interaction
**Tasks:**
- ChainSelector, ChainViewer, ChainStats, BlockViewer, BlockExplorer, NetworkStatus, NodeInfo, ChainSwitch, ChainBridge, ChainMonitor
- Network status indicators
- Block explorer links
- Chain switching UI

**Files:** `web/src/components/ontology-ui/crypto/chain/*.tsx`

### Cycle 70: Remaining Crypto Components (10 components)
**Goal:** Complete crypto suite
**Tasks:**
- SmartContract, ContractViewer, ContractInteraction, EventListener, SignMessage, VerifySignature, ENS, IPFS, Attestation, Identity
- Contract interaction forms
- Event logs
- Signature verification

**Files:** `web/src/components/ontology-ui/crypto/*.tsx`

---

## Phase 10: Universal, Layout, Integration, Advanced, App (Cycles 71-80)

### Cycle 71: Universal Components (9 components)
**Goal:** Platform-wide reusable components
**Tasks:**
- ThingCard (already done), EmptyState, ErrorBoundary, LoadingState, NotFound, Unauthorized, ServerError, MaintenanceMode, ComingSoon
- Consistent empty state illustrations
- Error pages with helpful messages
- Loading spinners with brand colors

**Files:** `web/src/components/ontology-ui/universal/*.tsx`

### Cycle 72: Layout Components (8 components)
**Goal:** Page layouts with design system
**Tasks:**
- AppLayout, DashboardLayout, MarketingLayout, AuthLayout, SettingsLayout, AdminLayout, BlankLayout, ErrorLayout
- Consistent header/nav/footer
- Responsive breakpoints
- Dark mode support

**Files:** `web/src/components/ontology-ui/layouts/*.tsx`

### Cycle 73: Integration Components (4 components)
**Goal:** External service integrations
**Tasks:**
- ChatToComponent, ComponentToChat, OntologyExplorer, APIExplorer
- Use design system for all UI
- Syntax highlighting for code
- Copy buttons with tooltips

**Files:** `web/src/components/ontology-ui/integration/*.tsx`

### Cycle 74: Advanced Components (7 components)
**Goal:** Complex interactive components
**Tasks:**
- DataTable, MultiSelect, RichTextEditor, CodeEditor, FileUpload, ImageCrop, MarkdownEditor
- Custom controls match design system
- Keyboard shortcuts
- Accessible by default

**Files:** `web/src/components/ontology-ui/advanced/*.tsx`

### Cycle 75: App Components (7 components)
**Goal:** Application-level components
**Tasks:**
- AppHeader, AppFooter, AppSidebar, AppNav, AppSearch, AppNotifications, AppUserMenu
- Responsive on mobile
- Active states for navigation
- Notification badges

**Files:** `web/src/components/ontology-ui/app/*.tsx`

### Cycle 76-80: Enhanced, Generative, Mail, Streaming, Visualization Components
**Goal:** Specialized component categories
**Tasks:**
- Enhanced: Enhanced UI patterns with animations
- Generative: AI-generated content components
- Mail: Email templates and viewers
- Streaming: Real-time streaming UI
- Visualization: Charts, graphs, maps
- All use 6-token system
- Consistent motion and elevation

**Files:** `web/src/components/ontology-ui/{enhanced,generative,mail,streaming,visualization}/*.tsx`

---

## Phase 11: Pages Migration (Cycles 81-90)

### Cycle 81-82: Home & Marketing Pages (20 pages)
**Goal:** Update public-facing pages
**Tasks:**
- Homepage, About, Features, Pricing, Blog, Docs, Changelog, Roadmap, Team, Contact, Legal, Privacy, Terms, Security, Careers, Press, Partners, Community, Events, Newsletter
- Hero sections with design system
- CTA buttons use primary variant
- Cards for feature showcases
- Consistent typography

**Files:** `web/src/pages/*.astro`, `web/src/pages/marketing/*.astro`

### Cycle 83-84: Dashboard & App Pages (20 pages)
**Goal:** Update authenticated app pages
**Tasks:**
- Dashboard, Profile, Settings, Notifications, Messages, Calendar, Tasks, Projects, Teams, Files, Analytics, Reports, Search, Explore, Activity, Help, Feedback, Billing, Account, Admin
- Use DashboardLayout
- Cards for widgets
- Tables for data
- Forms for settings

**Files:** `web/src/pages/dashboard/*.astro`, `web/src/pages/app/*.astro`

### Cycle 85-86: Shop & Marketplace Pages (20 pages)
**Goal:** Update e-commerce pages
**Tasks:**
- Shop, Products, Product detail, Cart, Checkout, Orders, Wishlist, Compare, Reviews, Sellers, Marketplace, Listings, Auctions, Bids, Sales, Purchases, Inventory, Shipping, Returns, Refunds
- Product cards with thing-level branding
- Shopping cart UI
- Checkout flow
- Order history

**Files:** `web/src/pages/shop/*.astro`, `web/src/pages/marketplace/*.astro`

### Cycle 87-88: Ontology-Specific Pages (20 pages)
**Goal:** Update ontology explorer pages
**Tasks:**
- Groups explorer, People directory, Things catalog, Connections graph, Events log, Knowledge base, Tokens, Courses, Agents, Content, Organizations, Communities, Channels, Conversations, Threads, Posts, Comments, Reactions, Tags, Categories
- Use ontology-ui components
- Filters and search
- Responsive grids

**Files:** `web/src/pages/groups/*.astro`, `web/src/pages/people/*.astro`, etc.

### Cycle 89-90: Remaining Pages (33 pages + Design Pages)
**Goal:** Complete all pages
**Tasks:**
- Auth pages (login, register, forgot password, reset, verify)
- Error pages (404, 500, 503)
- Admin pages (users, roles, permissions, settings, logs)
- Tool pages (generators, converters, validators)
- Design system pages (keep /design, update design-system-demo, thing-branding-demo)
- API docs
- Integration guides

**Files:** `web/src/pages/**/*.astro`

---

## Phase 12: Layouts & Global Styles (Cycles 91-95)

### Cycle 91: Update Layout Components
**Goal:** Master layouts with design system
**Tasks:**
- Layout.astro (base layout)
- MarketingLayout.astro
- DashboardLayout.astro
- AuthLayout.astro
- DocsLayout.astro
- ErrorLayout.astro
- BlogLayout.astro
- ShopLayout.astro
- Consistent header/footer/nav

**Files:** `web/src/layouts/*.astro`

### Cycle 92: Update Global Styles & Utilities
**Goal:** Clean up global CSS
**Tasks:**
- Remove all old token references
- Add dark mode class variants
- Update prose styles for markdown
- Scrollbar customization
- Print styles
- Utility classes

**Files:** `web/src/styles/global.css`, `web/src/styles/utilities.css`

### Cycle 93: Update Theme System
**Goal:** Theme switching and persistence
**Tasks:**
- ThemeProvider with 6-token support
- Theme switcher component
- localStorage persistence
- System preference detection
- Thing-level theme injection
- Preview mode for thing colors

**Files:** `web/src/components/theme/*.tsx`, `web/src/lib/theme.ts`

### Cycle 94: Update Component Library Documentation
**Goal:** Document all components
**Tasks:**
- Create component examples for each component
- Usage guidelines
- Props documentation
- Accessibility notes
- Interactive playground
- Export options

**Files:** `web/src/pages/components/*.astro`

### Cycle 95: Create Design System Gallery
**Goal:** Comprehensive showcase
**Tasks:**
- All components in one place
- Organized by category
- Search and filter
- Copy code snippets
- Dark mode preview
- Thing-level color preview

**Files:** `web/src/pages/design-system-gallery.astro`

---

## Phase 13: Testing & Quality Assurance (Cycles 96-98)

### Cycle 96: Visual Regression Testing
**Goal:** Ensure no visual bugs
**Tasks:**
- Screenshot all components in light mode
- Screenshot all components in dark mode
- Screenshot with thing-level color overrides
- Compare before/after
- Fix any regressions
- Document changes

**Tools:** Playwright, Percy, or Chromatic
**Output:** `one/events/design-system-visual-regression-report.md`

### Cycle 97: Accessibility Audit
**Goal:** WCAG AA compliance
**Tasks:**
- Test all components with screen reader
- Verify keyboard navigation
- Check color contrast (WCAG AA minimum 4.5:1)
- Test focus indicators
- Validate ARIA labels
- Fix all issues

**Tools:** axe DevTools, WAVE, Lighthouse
**Output:** `one/events/design-system-accessibility-audit.md`

### Cycle 98: Performance Optimization
**Goal:** Fast load times
**Tasks:**
- Analyze bundle size
- Remove unused CSS
- Optimize animations (use CSS transforms)
- Lazy load components
- Optimize images
- Measure Core Web Vitals

**Tools:** Lighthouse, Bundle Analyzer
**Output:** `one/events/design-system-performance-report.md`

---

## Phase 14: Documentation & Deployment (Cycles 99-100)

### Cycle 99: Final Documentation
**Goal:** Complete documentation suite
**Tasks:**
- Update `/one/knowledge/design-system.md`
- Update CLAUDE.md with new examples
- Create video tutorials
- Write blog post announcing design system
- Update README with screenshots
- Create migration guide for external users

**Files:** Multiple docs files

### Cycle 100: Production Deployment
**Goal:** Ship it! 🚀
**Tasks:**
- Final code review
- Merge all changes to main branch
- Tag release (v3.0.0 - Design System)
- Deploy to production
- Monitor for errors
- Celebrate! 🎉

**Commands:**
```bash
git checkout main
git merge claude/ontology-ui-design-system-012Qc6uoxpkNaq4btZyx3Z3i
git tag -a v3.0.0 -m "Complete 6-token design system implementation"
git push origin main --tags
bun run build && wrangler pages deploy dist
npx convex deploy
```

---

## Success Metrics

**Completed when:**
- ✅ All 279 components use 6-token system
- ✅ All 113 pages use design system
- ✅ All 9 layouts use design system
- ✅ Zero hardcoded colors (except design token definitions)
- ✅ 100% WCAG AA compliance
- ✅ Dark mode works everywhere
- ✅ Thing-level color overrides work everywhere
- ✅ Performance: LCP < 2.5s, CLS < 0.1, FID < 100ms
- ✅ Bundle size: CSS < 100KB, JS < 500KB
- ✅ Documentation: 100% component coverage

**Before starting each cycle:**
1. Read cycle description
2. Understand dependencies
3. Check examples in `/design` page
4. Test in both light and dark mode

**After completing each cycle:**
1. Test changes visually
2. Run `bunx astro check` for type errors
3. Test accessibility
4. Commit with clear message
5. Update progress in `/now`

---

## Quick Reference

**6 Tokens:**
```css
--color-background: 0 0% 93% (light) / 0 0% 10% (dark)
--color-foreground: 0 0% 100% (light) / 0 0% 13% (dark)
--color-font: 0 0% 13% (light) / 0 0% 100% (dark)
--color-primary: 216 55% 25% (constant)
--color-secondary: 219 14% 28% (constant)
--color-tertiary: 105 22% 25% (constant)
```

**Card Pattern:**
```tsx
<Card className="bg-background p-1 shadow-sm rounded-md">
  <CardContent className="bg-foreground p-4 rounded-md text-font">
    {/* content */}
  </CardContent>
</Card>
```

**Button States:**
```tsx
// Default: shadow-lg
// Hover: darken 5%, shadow-xl, scale-[1.02]
// Active: darken 7%, shadow-md, scale-[0.98]
// Focus: ring-2 ring-primary ring-offset-2
// Disabled: opacity-50, cursor-not-allowed
```

---

**Let's build the most beautiful, consistent, accessible design system! 🎨**
