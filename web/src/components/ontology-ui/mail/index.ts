/**
 * Mail/Inbox Components (Phase 4)
 *
 * Complete email management UI with ontology integration
 *
 * Cycles 83-89:
 * - InboxLayout: 3-panel resizable layout
 * - MailNav: Folder navigation with drag-drop
 * - MailList: Virtualized email list with bulk operations
 * - MailComposer: Rich text composer with attachments
 * - MailDetail: Email detail view with threads
 * - MailFilters: Advanced filtering UI
 * - AccountSwitcher: Multi-account management
 */

export type { AccountSwitcherProps, EmailAccount } from "./AccountSwitcher";
export { AccountSwitcher } from "./AccountSwitcher";
export type { InboxLayoutProps } from "./InboxLayout";
export { InboxLayout } from "./InboxLayout";
export type {
  EmailAttachment,
  EmailDraft,
  EmailRecipient,
  MailComposerProps,
} from "./MailComposer";
export { MailComposer } from "./MailComposer";
export type { EmailThread, MailDetailProps } from "./MailDetail";
export { MailDetail } from "./MailDetail";
export type {
  FilterOperator,
  FilterRule,
  MailFiltersProps,
  SavedFilter,
} from "./MailFilters";
export { MailFilters } from "./MailFilters";
export type {
  Email,
  MailListProps,
  SortField,
  SortOrder,
} from "./MailList";
export { MailList } from "./MailList";
export type { Label, MailFolder, MailNavProps, NavLink } from "./MailNav";
export { MailNav } from "./MailNav";
