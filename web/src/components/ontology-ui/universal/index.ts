/**
 * UNIVERSAL Ontology Components
 *
 * Cross-dimensional components that adapt to any of the 6 dimensions.
 * These components provide a unified interface for working with ontology data.
 */

// Universal Card - Adapts to any dimension
export { OntologyCard } from "./OntologyCard";
export type { OntologyCardProps } from "./OntologyCard";

// Universal List - Adapts to any dimension with search/filter/sort
export { OntologyList } from "./OntologyList";
export type { OntologyListProps } from "./OntologyList";

// Universal Grid - Responsive grid layout for any dimension
export { OntologyGrid } from "./OntologyGrid";
export type { OntologyGridProps } from "./OntologyGrid";

// Universal Table - Data table with sorting and filtering
export { OntologyTable } from "./OntologyTable";
export type { OntologyTableProps } from "./OntologyTable";

// Universal Form - Dynamic form builder with validation
export { OntologyForm } from "./OntologyForm";
export type { OntologyFormProps } from "./OntologyForm";

// Universal Modal - Modal dialog for any dimension
export { OntologyModal } from "./OntologyModal";
export type { OntologyModalProps } from "./OntologyModal";

// Universal Drawer - Slide-out drawer component
export { OntologyDrawer } from "./OntologyDrawer";
export type { OntologyDrawerProps } from "./OntologyDrawer";

// Universal Sheet - Bottom sheet component
export { OntologySheet } from "./OntologySheet";
export type { OntologySheetProps } from "./OntologySheet";

// Thing Card - Card wrapper with thing-level branding support
export { ThingCard } from "./ThingCard";
export type { ThingCardProps } from "./ThingCard";

// Re-export FormField type for convenience
export type { FormField } from "../types";

/**
 * Usage Examples
 *
 * @example Universal Card
 * ```tsx
 * import { OntologyCard } from "@/components/ontology-ui/universal";
 *
 * // Automatically renders the correct card type
 * <OntologyCard data={group} dimension="groups" />
 * <OntologyCard data={user} dimension="people" />
 * <OntologyCard data={product} dimension="things" />
 * ```
 *
 * @example Universal Grid
 * ```tsx
 * import { OntologyGrid } from "@/components/ontology-ui/universal";
 *
 * // 3-column responsive grid
 * <OntologyGrid
 *   items={products}
 *   dimension="things"
 *   columns={3}
 *   interactive
 *   onItemClick={(item) => router.push(`/things/${item._id}`)}
 * />
 * ```
 *
 * @example Universal Table
 * ```tsx
 * import { OntologyTable } from "@/components/ontology-ui/universal";
 *
 * // Sortable, filterable table
 * <OntologyTable
 *   items={events}
 *   dimension="events"
 *   columns={["type", "timestamp", "actorId"]}
 *   showPagination
 *   pageSize={20}
 * />
 * ```
 *
 * @example Universal List
 * ```tsx
 * import { OntologyList } from "@/components/ontology-ui/universal";
 *
 * // List with search and pagination
 * <OntologyList
 *   items={users}
 *   dimension="people"
 *   searchable
 *   paginated
 *   pageSize={10}
 * />
 * ```
 *
 * @example Universal Form
 * ```tsx
 * import { OntologyForm } from "@/components/ontology-ui/universal";
 *
 * // Dynamic form with validation
 * <OntologyForm
 *   dimension="things"
 *   fields={[
 *     { name: "name", label: "Product Name", type: "text", required: true },
 *     { name: "price", label: "Price", type: "number", required: true },
 *     { name: "description", label: "Description", type: "textarea" },
 *   ]}
 *   onSubmit={(data) => console.log(data)}
 * />
 * ```
 *
 * @example Universal Modal
 * ```tsx
 * import { OntologyModal } from "@/components/ontology-ui/universal";
 *
 * // Dimension-aware modal
 * <OntologyModal
 *   dimension="events"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Event Details"
 *   description="View and edit event information"
 * >
 *   <EventForm />
 * </OntologyModal>
 * ```
 *
 * @example Universal Drawer
 * ```tsx
 * import { OntologyDrawer } from "@/components/ontology-ui/universal";
 *
 * // Slide-out drawer
 * <OntologyDrawer
 *   dimension="connections"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   side="right"
 *   title="Connection Details"
 * >
 *   <ConnectionInfo />
 * </OntologyDrawer>
 * ```
 *
 * @example Universal Sheet
 * ```tsx
 * import { OntologySheet } from "@/components/ontology-ui/universal";
 *
 * // Bottom sheet for mobile
 * <OntologySheet
 *   dimension="knowledge"
 *   trigger={<Button>Open Search</Button>}
 *   title="Search Knowledge"
 * >
 *   <SearchInterface />
 * </OntologySheet>
 * ```
 *
 * @example Thing Card with Branding
 * ```tsx
 * import { ThingCard } from "@/components/ontology-ui/universal";
 * import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 * import { Button } from "@/components/ui/button";
 *
 * // Uses platform defaults if thing.properties.colors is undefined
 * <ThingCard thing={product}>
 *   <CardHeader>
 *     <CardTitle>{product.name}</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <p className="text-font">{product.properties.description}</p>
 *     <Button variant="primary">Purchase</Button>
 *   </CardContent>
 * </ThingCard>
 *
 * // Automatically applies custom colors if defined in thing.properties.colors
 * const customProduct = {
 *   ...product,
 *   properties: {
 *     colors: {
 *       background: '270 50% 92%',
 *       foreground: '270 50% 98%',
 *       font: '270 50% 15%',
 *       primary: '280 100% 60%',
 *       secondary: '200 100% 50%',
 *       tertiary: '150 80% 40%'
 *     }
 *   }
 * };
 *
 * <ThingCard thing={customProduct}>
 *   <CardHeader>
 *     <CardTitle className="text-font">Custom Branded Product</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     <Button variant="primary">Buy Now</Button>
 *   </CardContent>
 * </ThingCard>
 * ```
 */
