/**
 * Auto-generate component registry from ontology-ui components
 * INTEGRATION CYCLE 1: Component Registry Integration
 */

import fs from 'fs';
import path from 'path';

interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  path: string;
  description: string;
  tags: string[];
  directory: string;
}

const ONTOLOGY_UI_DIR = path.join(process.cwd(), 'src/components/ontology-ui');

// Category mappings based on directory structure
const CATEGORY_MAP: Record<string, { category: string; description: string; icon: string }> = {
  'groups': {
    category: 'groups',
    description: 'Multi-tenant containers with infinite nesting',
    icon: '🏢'
  },
  'people': {
    category: 'people',
    description: 'Authorization, roles, and user management',
    icon: '👥'
  },
  'things': {
    category: 'things',
    description: 'All entities (products, courses, tokens, agents)',
    icon: '📦'
  },
  'connections': {
    category: 'connections',
    description: 'Relationships between entities',
    icon: '🔗'
  },
  'events': {
    category: 'events',
    description: 'Complete audit trail and activity tracking',
    icon: '📅'
  },
  'knowledge': {
    category: 'knowledge',
    description: 'Labels, vectors, and semantic search',
    icon: '🧠'
  },
  'universal': {
    category: 'universal',
    description: 'Cross-dimensional components',
    icon: '🌐'
  },
  'layouts': {
    category: 'layouts',
    description: 'Navigation and page structure',
    icon: '🎨'
  },
  'generative': {
    category: 'generative',
    description: 'AI-powered UI generation',
    icon: '🤖'
  },
  'app': {
    category: 'app',
    description: 'Application-level components',
    icon: '📱'
  },
  'streaming': {
    category: 'streaming',
    description: 'Real-time data and live updates',
    icon: '🚀'
  },
  'visualization': {
    category: 'visualization',
    description: 'Charts and data visualization',
    icon: '📊'
  },
  'crypto': {
    category: 'crypto',
    description: 'Cryptocurrency and Web3',
    icon: '💰'
  },
  'advanced': {
    category: 'advanced',
    description: 'Advanced UI features',
    icon: '✨'
  },
  'enhanced': {
    category: 'enhanced',
    description: 'Enhanced component variants',
    icon: '🔄'
  },
  'integration': {
    category: 'integration',
    description: 'Third-party integrations',
    icon: '🔌'
  },
  'mail': {
    category: 'mail',
    description: 'Email and messaging',
    icon: '📧'
  }
};

// Generate semantic tags based on component name
function generateTags(componentName: string, category: string): string[] {
  const tags: string[] = [category];

  // Common patterns
  const patterns: Record<string, string[]> = {
    'Card': ['card', 'display', 'container'],
    'List': ['list', 'collection', 'grid'],
    'Grid': ['grid', 'layout', 'collection'],
    'Form': ['form', 'input', 'create'],
    'Editor': ['editor', 'modify', 'update'],
    'Selector': ['selector', 'picker', 'choose'],
    'Search': ['search', 'find', 'filter'],
    'Filter': ['filter', 'search', 'sort'],
    'Button': ['button', 'action', 'click'],
    'Badge': ['badge', 'label', 'tag'],
    'Avatar': ['avatar', 'image', 'profile'],
    'Timeline': ['timeline', 'history', 'chronological'],
    'Graph': ['graph', 'visualization', 'network'],
    'Chart': ['chart', 'visualization', 'data'],
    'Modal': ['modal', 'dialog', 'popup'],
    'Drawer': ['drawer', 'panel', 'sidebar'],
    'Menu': ['menu', 'navigation', 'dropdown'],
    'Wallet': ['wallet', 'crypto', 'web3'],
    'Token': ['token', 'crypto', 'currency'],
    'NFT': ['nft', 'crypto', 'collectible'],
    'Swap': ['swap', 'exchange', 'trade'],
    'Streaming': ['streaming', 'realtime', 'live'],
    'Live': ['live', 'realtime', 'streaming']
  };

  Object.entries(patterns).forEach(([pattern, patternTags]) => {
    if (componentName.includes(pattern)) {
      tags.push(...patternTags);
    }
  });

  return [...new Set(tags)];
}

// Generate description based on component name and category
function generateDescription(componentName: string, category: string): string {
  const categoryInfo = CATEGORY_MAP[category];
  const categoryDesc = categoryInfo?.description || category;

  // Special cases
  const specialCases: Record<string, string> = {
    'ThingCard': 'Universal card for rendering any thing type (product, course, token, agent)',
    'PersonCard': 'User profile card with avatar, role, and metadata',
    'EventCard': 'Activity event display with timestamp and details',
    'GroupCard': 'Group container with members and hierarchy',
    'ConnectionCard': 'Relationship visualization between entities',
    'WalletConnectButton': 'Connect Web3 wallet (MetaMask, WalletConnect, etc.)',
    'TokenSwap': 'DEX token swap interface with slippage settings',
    'NFTMarketplace': 'NFT gallery and marketplace with buy/sell features',
    'LiveActivityFeed': 'Real-time activity stream with automatic updates',
    'DynamicDashboard': 'AI-generated dashboard with drag-drop widgets'
  };

  if (specialCases[componentName]) {
    return specialCases[componentName];
  }

  // Pattern-based descriptions
  if (componentName.includes('Card')) return `Display ${category} information in card format`;
  if (componentName.includes('List')) return `Scrollable list of ${category} with filtering`;
  if (componentName.includes('Grid')) return `Grid layout for ${category} items`;
  if (componentName.includes('Form')) return `Form for creating/editing ${category}`;
  if (componentName.includes('Editor')) return `Editor for modifying ${category} properties`;
  if (componentName.includes('Selector')) return `Dropdown selector for choosing ${category}`;
  if (componentName.includes('Search')) return `Search interface for finding ${category}`;
  if (componentName.includes('Filter')) return `Advanced filtering for ${category}`;
  if (componentName.includes('Timeline')) return `Timeline visualization of ${category}`;
  if (componentName.includes('Graph')) return `Graph visualization of ${category} relationships`;

  return `${componentName} component for ${categoryDesc}`;
}

// Scan directory and generate component metadata
function scanComponents(dir: string, baseDir: string = dir): ComponentMetadata[] {
  const components: ComponentMetadata[] = [];

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip utility directories
      if (['hooks', 'types', 'utils'].includes(file)) continue;

      // Recursively scan subdirectories
      components.push(...scanComponents(fullPath, baseDir));
    } else if (file.endsWith('.tsx') && !file.includes('example')) {
      const componentName = path.basename(file, '.tsx');

      // Determine category from directory
      const relativePath = path.relative(baseDir, dir);
      const parts = relativePath.split(path.sep);
      const topLevelDir = parts[0] || 'app';

      const category = CATEGORY_MAP[topLevelDir]?.category || topLevelDir;

      const importPath = `@/components/ontology-ui/${relativePath ? relativePath + '/' : ''}${componentName}`;

      components.push({
        id: componentName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: componentName,
        category,
        path: importPath,
        description: generateDescription(componentName, category),
        tags: generateTags(componentName, category),
        directory: topLevelDir
      });
    }
  }

  return components;
}

// Generate TypeScript code for component library
function generateComponentLibraryCode(components: ComponentMetadata[]): string {
  const grouped = components.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, ComponentMetadata[]>);

  let code = `/**
 * Ontology UI Component Registry
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Generated: ${new Date().toISOString()}
 * Total Components: ${components.length}
 */

import type { ComponentItem } from "@/stores/componentPicker";

`;

  // Generate component arrays by category
  Object.entries(grouped).sort().forEach(([category, items]) => {
    const categoryInfo = CATEGORY_MAP[category];
    code += `\n/**\n * ${category.toUpperCase()} Components (${items.length})\n`;
    code += ` * ${categoryInfo?.description || category}\n */\n`;
    code += `export const ${category.toUpperCase()}_COMPONENTS: ComponentItem[] = [\n`;

    items.sort((a, b) => a.name.localeCompare(b.name)).forEach(comp => {
      code += `\t{\n`;
      code += `\t\tid: "${comp.id}",\n`;
      code += `\t\tname: "${comp.name}",\n`;
      code += `\t\tcategory: "ontology",\n`;
      code += `\t\tpath: "${comp.path}",\n`;
      code += `\t\tdescription: "${comp.description}",\n`;
      code += `\t\ttags: ${JSON.stringify(comp.tags)},\n`;
      code += `\t\tpreviewCode: \`<${comp.name} />\`,\n`;
      code += `\t\texample: \`import { ${comp.name} } from '${comp.path}';\n\n<${comp.name} client:load />\`,\n`;
      code += `\t},\n`;
    });

    code += `];\n`;
  });

  // Generate combined export
  code += `\n/**\n * All Ontology UI Components (${components.length})\n */\n`;
  code += `export const ONTOLOGY_UI_COMPONENTS: ComponentItem[] = [\n`;
  Object.keys(grouped).sort().forEach(category => {
    code += `\t...${category.toUpperCase()}_COMPONENTS,\n`;
  });
  code += `];\n`;

  // Generate category counts
  code += `\n/**\n * Component Count by Category\n */\n`;
  code += `export const ONTOLOGY_UI_CATEGORY_COUNTS: Record<string, number> = {\n`;
  Object.entries(grouped).sort().forEach(([category, items]) => {
    code += `\t"${category}": ${items.length},\n`;
  });
  code += `};\n`;

  return code;
}

// Main execution
function main() {
  console.log('🔍 Scanning ontology-ui components...');
  const components = scanComponents(ONTOLOGY_UI_DIR);

  console.log(`\n📊 Found ${components.length} components across ${Object.keys(CATEGORY_MAP).length} categories\n`);

  // Group by category for stats
  const grouped = components.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, ComponentMetadata[]>);

  Object.entries(grouped).sort().forEach(([category, items]) => {
    const icon = CATEGORY_MAP[category]?.icon || '📦';
    console.log(`${icon} ${category.padEnd(15)} ${items.length} components`);
  });

  console.log('\n✅ Generating component registry code...\n');
  const code = generateComponentLibraryCode(components);

  const outputPath = path.join(process.cwd(), 'src/lib/componentRegistryGenerated.ts');
  fs.writeFileSync(outputPath, code, 'utf-8');

  console.log(`✅ Component registry generated: ${outputPath}`);
  console.log(`📝 Total: ${components.length} components`);
}

main();
