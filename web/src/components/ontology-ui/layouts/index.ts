/**
 * LAYOUT Components
 *
 * Navigation and layout components for ontology-aware apps.
 * Complete set of 8 layout components (#93-100).
 */

export type { CommandPaletteProps } from "./CommandPalette";
// #99 - Quick command/search palette
export { CommandPalette } from "./CommandPalette";
// #94 - Switch between 6 dimensions
export { DimensionSwitcher } from "./DimensionSwitcher";
export type { BreadcrumbItem } from "./OntologyBreadcrumb";
// #95 - Multi-level breadcrumb
export { OntologyBreadcrumb } from "./OntologyBreadcrumb";
export type { FooterLink } from "./OntologyFooter";
// #98 - Footer with platform info
export { OntologyFooter } from "./OntologyFooter";
export type { OntologyHeaderProps } from "./OntologyHeader";
// #97 - Header with group/user context
export { OntologyHeader } from "./OntologyHeader";
// #93 - Navigation with dimension switching
export { OntologyNav } from "./OntologyNav";
// #96 - Sidebar with dimension navigation
export { OntologySidebar } from "./OntologySidebar";
export type { QuickSwitcherProps } from "./QuickSwitcher";
// #100 - Quick switcher for entities
export { QuickSwitcher } from "./QuickSwitcher";
