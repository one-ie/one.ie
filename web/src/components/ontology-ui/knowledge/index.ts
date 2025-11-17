/**
 * KNOWLEDGE Dimension Components
 *
 * Labels, vectors, and semantic search (10 components total)
 * Component numbers: #75-84 from the ontology-ui library
 */

// ============================================================================
// Available Components
// ============================================================================

export type { CategoryTreeProps } from "./CategoryTree";
// #83 - CategoryTree - Hierarchical category browser ✅ NEW
export { CategoryTree } from "./CategoryTree";
export type { KnowledgeGraphProps } from "./KnowledgeGraph";
// #82 - KnowledgeGraph - Visual knowledge graph
export { KnowledgeGraph } from "./KnowledgeGraph";
export type { LabelCardProps } from "./LabelCard";
// #75 - LabelCard - Card for displaying labels
export { LabelCard } from "./LabelCard";
export type { LabelCreatorProps } from "./LabelCreator";
// #77 - LabelCreator - Form for creating labels
export { LabelCreator } from "./LabelCreator";
export type { LabelListProps } from "./LabelList";
// #76 - LabelList - List of labels with counts
export { LabelList } from "./LabelList";
export type { SearchBarProps } from "./SearchBar";
// #79 - SearchBar - Universal search bar with autocomplete
export { SearchBar } from "./SearchBar";
export type { SearchResultsProps } from "./SearchResults";
// #80 - SearchResults - Search results with highlighting
export { SearchResults } from "./SearchResults";
export type { TagCloudProps } from "./TagCloud";
// #78 - TagCloud - Visual tag cloud
export { TagCloud } from "./TagCloud";
export type { TaxonomyBrowserProps } from "./TaxonomyBrowser";
// #84 - TaxonomyBrowser - Browse and navigate taxonomies ✅ NEW
export { TaxonomyBrowser } from "./TaxonomyBrowser";
export type { VectorSearchProps } from "./VectorSearch";
// #81 - VectorSearch - Semantic search interface
export { VectorSearch } from "./VectorSearch";

/**
 * KNOWLEDGE Dimension Overview
 *
 * The KNOWLEDGE dimension provides components for:
 * - Labeling and categorization
 * - Tag management and tag clouds
 * - Semantic search (vector embeddings)
 * - Knowledge graphs and taxonomies
 * - Search interfaces with autocomplete
 *
 * All components work with the `knowledge` table which stores:
 * - Labels (categorical tags with confidence scores)
 * - Vectors (embeddings for semantic search)
 *
 * Components are designed to work with both Label and Vector types
 * from the ontology schema.
 */
