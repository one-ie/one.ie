/**
 * Ontology UI Component Registry
 *
 * Catalog of 286+ ontology-ui components organized by category
 * Used for AI chat suggestions, component picker, and search
 */

export interface OntologyComponent {
  name: string;
  category: OntologyCategory;
  description: string;
  path: string;
  tags: string[];
  example?: string;
}

export type OntologyCategory =
  | 'things'
  | 'people'
  | 'groups'
  | 'connections'
  | 'events'
  | 'knowledge'
  | 'crypto'
  | 'streaming'
  | 'generative'
  | 'layouts'
  | 'universal'
  | 'advanced'
  | 'visualization';

export const CATEGORY_INFO: Record<OntologyCategory, { icon: string; description: string; color: string }> = {
  things: {
    icon: '📦',
    description: 'Products, courses, tokens, agents, and other entities',
    color: 'green'
  },
  people: {
    icon: '👥',
    description: 'Users, profiles, teams, and authorization',
    color: 'purple'
  },
  groups: {
    icon: '🏢',
    description: 'Organizations, teams, and hierarchies',
    color: 'blue'
  },
  connections: {
    icon: '🔗',
    description: 'Relationships and network graphs',
    color: 'orange'
  },
  events: {
    icon: '📅',
    description: 'Activity feeds, timelines, and notifications',
    color: 'red'
  },
  knowledge: {
    icon: '🧠',
    description: 'Search, labels, and semantic discovery',
    color: 'yellow'
  },
  crypto: {
    icon: '💰',
    description: 'Web3, DeFi, NFTs, and blockchain',
    color: 'amber'
  },
  streaming: {
    icon: '🚀',
    description: 'Real-time data and live updates',
    color: 'cyan'
  },
  generative: {
    icon: '🤖',
    description: 'AI-powered UI generation',
    color: 'pink'
  },
  layouts: {
    icon: '🎨',
    description: 'Navigation and page structure',
    color: 'indigo'
  },
  universal: {
    icon: '🌐',
    description: 'Cross-dimensional components',
    color: 'slate'
  },
  advanced: {
    icon: '✨',
    description: 'Premium UI features',
    color: 'violet'
  },
  visualization: {
    icon: '📊',
    description: 'Charts, graphs, and data viz',
    color: 'emerald'
  }
};

/**
 * Ontology UI Component Catalog
 *
 * Organized by category with searchable metadata
 */
export const ONTOLOGY_COMPONENTS: OntologyComponent[] = [
  // THINGS
  {
    name: 'ThingCard',
    category: 'things',
    description: 'Display any entity (product, course, token, agent)',
    path: '@/components/ontology-ui/things/ThingCard',
    tags: ['card', 'entity', 'display', 'product', 'course'],
    example: '<ThingCard thing={data} type="product" />'
  },
  {
    name: 'ProductCard',
    category: 'things',
    description: 'Product display with price and image',
    path: '@/components/ontology-ui/things/ProductCard',
    tags: ['product', 'ecommerce', 'shopping', 'card'],
    example: '<ProductCard product={product} />'
  },
  {
    name: 'CourseCard',
    category: 'things',
    description: 'Course card with enrollment info',
    path: '@/components/ontology-ui/things/CourseCard',
    tags: ['course', 'learning', 'education', 'card'],
    example: '<CourseCard course={course} />'
  },
  {
    name: 'TokenCard',
    category: 'things',
    description: 'Token display with supply and price',
    path: '@/components/ontology-ui/things/TokenCard',
    tags: ['token', 'crypto', 'web3', 'card'],
    example: '<TokenCard token={token} />'
  },
  {
    name: 'AgentCard',
    category: 'things',
    description: 'AI agent display with capabilities',
    path: '@/components/ontology-ui/things/AgentCard',
    tags: ['agent', 'ai', 'automation', 'card'],
    example: '<AgentCard agent={agent} />'
  },

  // PEOPLE
  {
    name: 'UserCard',
    category: 'people',
    description: 'User profile card with avatar and role',
    path: '@/components/ontology-ui/people/UserCard',
    tags: ['user', 'profile', 'avatar', 'person'],
    example: '<UserCard user={user} />'
  },
  {
    name: 'UserProfile',
    category: 'people',
    description: 'Complete user profile with bio and stats',
    path: '@/components/ontology-ui/people/UserProfile',
    tags: ['user', 'profile', 'biography', 'stats'],
    example: '<UserProfile userId={userId} />'
  },
  {
    name: 'TeamCard',
    category: 'people',
    description: 'Team display with members',
    path: '@/components/ontology-ui/people/TeamCard',
    tags: ['team', 'group', 'collaboration', 'members'],
    example: '<TeamCard team={team} />'
  },
  {
    name: 'RoleBadge',
    category: 'people',
    description: 'Role indicator badge',
    path: '@/components/ontology-ui/people/RoleBadge',
    tags: ['role', 'permission', 'badge', 'authorization'],
    example: '<RoleBadge role={role} />'
  },

  // GROUPS
  {
    name: 'GroupCard',
    category: 'groups',
    description: 'Organization/group card',
    path: '@/components/ontology-ui/groups/GroupCard',
    tags: ['group', 'organization', 'team', 'hierarchy'],
    example: '<GroupCard group={group} />'
  },
  {
    name: 'GroupTree',
    category: 'groups',
    description: 'Hierarchical group visualization',
    path: '@/components/ontology-ui/groups/GroupTree',
    tags: ['hierarchy', 'tree', 'organization', 'structure'],
    example: '<GroupTree groupId={groupId} />'
  },
  {
    name: 'GroupSelector',
    category: 'groups',
    description: 'Group selection dropdown',
    path: '@/components/ontology-ui/groups/GroupSelector',
    tags: ['selector', 'dropdown', 'navigation', 'switch'],
    example: '<GroupSelector onSelect={handleSelect} />'
  },

  // CONNECTIONS
  {
    name: 'ConnectionList',
    category: 'connections',
    description: 'List of relationships',
    path: '@/components/ontology-ui/connections/ConnectionList',
    tags: ['connection', 'relationship', 'list', 'links'],
    example: '<ConnectionList connections={connections} />'
  },
  {
    name: 'NetworkGraph',
    category: 'connections',
    description: 'Network visualization graph',
    path: '@/components/ontology-ui/connections/NetworkGraph',
    tags: ['graph', 'network', 'visualization', 'nodes'],
    example: '<NetworkGraph nodes={nodes} edges={edges} />'
  },

  // EVENTS
  {
    name: 'EventCard',
    category: 'events',
    description: 'Event display card',
    path: '@/components/ontology-ui/events/EventCard',
    tags: ['event', 'activity', 'card', 'timeline'],
    example: '<EventCard event={event} />'
  },
  {
    name: 'ActivityFeed',
    category: 'events',
    description: 'Live activity feed',
    path: '@/components/ontology-ui/events/ActivityFeed',
    tags: ['activity', 'feed', 'timeline', 'realtime'],
    example: '<ActivityFeed groupId={groupId} />'
  },
  {
    name: 'EventTimeline',
    category: 'events',
    description: 'Timeline of events',
    path: '@/components/ontology-ui/events/EventTimeline',
    tags: ['timeline', 'chronological', 'history', 'events'],
    example: '<EventTimeline events={events} />'
  },
  {
    name: 'NotificationCard',
    category: 'events',
    description: 'Notification display',
    path: '@/components/ontology-ui/events/NotificationCard',
    tags: ['notification', 'alert', 'message', 'card'],
    example: '<NotificationCard notification={notification} />'
  },

  // KNOWLEDGE
  {
    name: 'SearchBar',
    category: 'knowledge',
    description: 'Universal search input',
    path: '@/components/ontology-ui/knowledge/SearchBar',
    tags: ['search', 'input', 'query', 'find'],
    example: '<SearchBar onSearch={handleSearch} />'
  },
  {
    name: 'SearchResults',
    category: 'knowledge',
    description: 'Search results display',
    path: '@/components/ontology-ui/knowledge/SearchResults',
    tags: ['search', 'results', 'list', 'findings'],
    example: '<SearchResults results={results} />'
  },
  {
    name: 'LabelCloud',
    category: 'knowledge',
    description: 'Tag cloud visualization',
    path: '@/components/ontology-ui/knowledge/LabelCloud',
    tags: ['labels', 'tags', 'cloud', 'visualization'],
    example: '<LabelCloud labels={labels} />'
  },

  // CRYPTO
  {
    name: 'WalletConnectButton',
    category: 'crypto',
    description: 'Web3 wallet connection button',
    path: '@/components/ontology-ui/crypto/web3/WalletConnectButton',
    tags: ['wallet', 'web3', 'connect', 'metamask'],
    example: '<WalletConnectButton />'
  },
  {
    name: 'TokenSwap',
    category: 'crypto',
    description: 'DEX token swap interface',
    path: '@/components/ontology-ui/crypto/dex/TokenSwap',
    tags: ['swap', 'dex', 'exchange', 'trade'],
    example: '<TokenSwap />'
  },
  {
    name: 'NFTCard',
    category: 'crypto',
    description: 'NFT display card',
    path: '@/components/ontology-ui/crypto/nft/NFTCard',
    tags: ['nft', 'collectible', 'card', 'display'],
    example: '<NFTCard nft={nft} />'
  },
  {
    name: 'NFTMarketplace',
    category: 'crypto',
    description: 'NFT marketplace grid',
    path: '@/components/ontology-ui/crypto/nft/NFTMarketplace',
    tags: ['nft', 'marketplace', 'gallery', 'grid'],
    example: '<NFTMarketplace />'
  },
  {
    name: 'WalletBalance',
    category: 'crypto',
    description: 'Wallet balance display',
    path: '@/components/ontology-ui/crypto/wallet/WalletBalance',
    tags: ['wallet', 'balance', 'crypto', 'portfolio'],
    example: '<WalletBalance address={address} />'
  },

  // STREAMING
  {
    name: 'ChatMessage',
    category: 'streaming',
    description: 'Chat message component',
    path: '@/components/ontology-ui/streaming/ChatMessage',
    tags: ['chat', 'message', 'conversation', 'realtime'],
    example: '<ChatMessage message={message} />'
  },
  {
    name: 'LiveActivityFeed',
    category: 'streaming',
    description: 'Real-time activity updates',
    path: '@/components/ontology-ui/streaming/LiveActivityFeed',
    tags: ['live', 'activity', 'realtime', 'feed'],
    example: '<LiveActivityFeed groupId={groupId} />'
  },
  {
    name: 'StreamingResponse',
    category: 'streaming',
    description: 'AI streaming response display',
    path: '@/components/ontology-ui/streaming/StreamingResponse',
    tags: ['streaming', 'ai', 'response', 'realtime'],
    example: '<StreamingResponse stream={stream} />'
  },
  {
    name: 'LiveNotifications',
    category: 'streaming',
    description: 'Real-time notification center',
    path: '@/components/ontology-ui/streaming/LiveNotifications',
    tags: ['notifications', 'realtime', 'alerts', 'live'],
    example: '<LiveNotifications userId={userId} />'
  },

  // GENERATIVE
  {
    name: 'UIComponentPreview',
    category: 'generative',
    description: 'Preview generated UI components',
    path: '@/components/ontology-ui/generative/UIComponentPreview',
    tags: ['preview', 'component', 'generation', 'ai'],
    example: '<UIComponentPreview code={code} />'
  },
  {
    name: 'DynamicForm',
    category: 'generative',
    description: 'AI-generated dynamic form',
    path: '@/components/ontology-ui/generative/DynamicForm',
    tags: ['form', 'dynamic', 'generation', 'ai'],
    example: '<DynamicForm schema={schema} />'
  },

  // LAYOUTS
  {
    name: 'DimensionNav',
    category: 'layouts',
    description: 'Ontology dimension navigation',
    path: '@/components/ontology-ui/layouts/DimensionNav',
    tags: ['navigation', 'ontology', 'dimensions', 'menu'],
    example: '<DimensionNav />'
  },
  {
    name: 'CommandPalette',
    category: 'layouts',
    description: 'Command palette for quick actions',
    path: '@/components/ontology-ui/layouts/CommandPalette',
    tags: ['command', 'palette', 'search', 'shortcuts'],
    example: '<CommandPalette />'
  },

  // VISUALIZATION
  {
    name: 'TimeSeriesChart',
    category: 'visualization',
    description: 'Time series line chart',
    path: '@/components/ontology-ui/visualization/TimeSeriesChart',
    tags: ['chart', 'timeseries', 'graph', 'data'],
    example: '<TimeSeriesChart data={data} />'
  },
  {
    name: 'NetworkDiagram',
    category: 'visualization',
    description: 'Network relationship diagram',
    path: '@/components/ontology-ui/visualization/NetworkDiagram',
    tags: ['network', 'diagram', 'graph', 'relationships'],
    example: '<NetworkDiagram nodes={nodes} />'
  },
  {
    name: 'HeatmapChart',
    category: 'visualization',
    description: 'Heatmap visualization',
    path: '@/components/ontology-ui/visualization/HeatmapChart',
    tags: ['heatmap', 'chart', 'visualization', 'data'],
    example: '<HeatmapChart data={data} />'
  },

  // UNIVERSAL
  {
    name: 'EntityDisplay',
    category: 'universal',
    description: 'Universal entity renderer',
    path: '@/components/ontology-ui/universal/EntityDisplay',
    tags: ['entity', 'universal', 'display', 'adaptive'],
    example: '<EntityDisplay entity={entity} />'
  },
  {
    name: 'UnifiedSearch',
    category: 'universal',
    description: 'Search across all dimensions',
    path: '@/components/ontology-ui/universal/UnifiedSearch',
    tags: ['search', 'universal', 'omnisearch', 'all'],
    example: '<UnifiedSearch />'
  }
];

/**
 * Search components by query
 */
export function searchComponents(query: string, category?: OntologyCategory): OntologyComponent[] {
  const lowerQuery = query.toLowerCase();

  return ONTOLOGY_COMPONENTS.filter(component => {
    // Category filter
    if (category && component.category !== category) {
      return false;
    }

    // Text search across name, description, and tags
    return (
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Get components by category
 */
export function getComponentsByCategory(category: OntologyCategory): OntologyComponent[] {
  return ONTOLOGY_COMPONENTS.filter(c => c.category === category);
}

/**
 * Get component suggestions based on user intent
 */
export function suggestComponents(userMessage: string): OntologyComponent[] {
  const message = userMessage.toLowerCase();

  // Intent mapping
  const intentPatterns = [
    { patterns: ['product', 'shop', 'ecommerce', 'buy', 'sell'], tags: ['product', 'ecommerce'] },
    { patterns: ['user', 'profile', 'account', 'person'], tags: ['user', 'profile'] },
    { patterns: ['payment', 'wallet', 'crypto', 'web3', 'nft'], tags: ['crypto', 'wallet', 'nft'] },
    { patterns: ['chat', 'message', 'conversation'], tags: ['chat', 'message'] },
    { patterns: ['search', 'find', 'query'], tags: ['search'] },
    { patterns: ['team', 'group', 'organization'], tags: ['team', 'group'] },
    { patterns: ['activity', 'feed', 'timeline', 'event'], tags: ['activity', 'feed', 'event'] },
    { patterns: ['chart', 'graph', 'visualization', 'data'], tags: ['chart', 'graph', 'visualization'] },
  ];

  // Find matching components
  const suggestions: OntologyComponent[] = [];

  for (const { patterns, tags } of intentPatterns) {
    if (patterns.some(pattern => message.includes(pattern))) {
      for (const tag of tags) {
        const matches = ONTOLOGY_COMPONENTS.filter(c =>
          c.tags.includes(tag) && !suggestions.includes(c)
        );
        suggestions.push(...matches);
      }
    }
  }

  // Limit to top 6 suggestions
  return suggestions.slice(0, 6);
}
