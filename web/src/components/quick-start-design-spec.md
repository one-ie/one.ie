# Quick Start Components - Implementation Specification

This document specifies the three React components that power the Quick Start page visual design.

---

## Component 1: OntologyFlow

**Purpose:** Render an animated 6-dimension ontology flow diagram

**File:** `src/components/OntologyFlow.tsx`

**Props:**

```typescript
interface OntologyFlowProps {
  animated?: boolean;           // Default: true
  showLabels?: boolean;         // Default: true
  colorScheme?: 'light' | 'dark'; // Defaults to current theme
  className?: string;           // Additional CSS classes
}
```

**Rendering Structure:**

```typescript
export function OntologyFlow({
  animated = true,
  showLabels = true,
  colorScheme = 'light',
  className = ''
}: OntologyFlowProps) {
  // Renders a 2x3 grid (or vertical stack on mobile)
  // with 6 colored boxes connected by animated arrows

  return (
    <div className={`flow-container ${className}`}>
      {/* Row 1: Groups → People → Things */}
      <div className="flow-row flow-row-1">
        <FlowBox dimension="groups" animated={animated} />
        <AnimatedArrow direction="right" animated={animated} />
        <FlowBox dimension="people" animated={animated} />
        <AnimatedArrow direction="right" animated={animated} />
        <FlowBox dimension="things" animated={animated} />
      </div>

      {/* Vertical arrow down */}
      <AnimatedArrow direction="down" animated={animated} />

      {/* Row 2: Connections ← Events ← Knowledge */}
      <div className="flow-row flow-row-2">
        <FlowBox dimension="connections" animated={animated} />
        <AnimatedArrow direction="left" animated={animated} />
        <FlowBox dimension="events" animated={animated} />
        <AnimatedArrow direction="left" animated={animated} />
        <FlowBox dimension="knowledge" animated={animated} />
      </div>
    </div>
  );
}

interface FlowBoxProps {
  dimension: 'groups' | 'people' | 'things' | 'connections' | 'events' | 'knowledge';
  animated: boolean;
}

function FlowBox({ dimension, animated }: FlowBoxProps) {
  const dimensionData = {
    groups: { label: 'GROUPS', icon: Users, color: 'groups', desc: 'Multi-tenant isolation' },
    people: { label: 'PEOPLE', icon: Shield, color: 'people', desc: 'Authorization' },
    things: { label: 'THINGS', icon: Box, color: 'things', desc: 'All entities' },
    connections: { label: 'CONNECTIONS', icon: Link2, color: 'connections', desc: 'Relationships' },
    events: { label: 'EVENTS', icon: Clock, color: 'events', desc: 'Actions recorded' },
    knowledge: { label: 'KNOWLEDGE', icon: Brain, color: 'knowledge', desc: 'Intelligence' }
  };

  const data = dimensionData[dimension];
  const Icon = data.icon;

  return (
    <div className={`flow-box flow-box-${dimension} ${animated ? 'animate-fade-in' : ''}`}>
      <div className="flow-box-icon">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="flow-box-label">{data.label}</div>
      {/* Hover tooltip shows description */}
      <div className="flow-box-tooltip hidden group-hover:block">
        {data.desc}
      </div>
    </div>
  );
}

function AnimatedArrow({ direction, animated }: { direction: 'right' | 'left' | 'down'; animated: boolean }) {
  // SVG arrow that animates (pulse effect)
  // Direction determines rotation and positioning
  return (
    <svg className={`arrow arrow-${direction} ${animated ? 'animate-pulse' : ''}`}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
        </marker>
      </defs>
      <line x1="0" y1="0" x2="40" y2="0" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
    </svg>
  );
}
```

**Styling (Tailwind v4):**

```css
.flow-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
  border-radius: 1rem;
  background: hsl(var(--color-secondary));

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 1rem;
  }
}

.flow-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.flow-box {
  width: 120px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }

  &.flow-box-groups {
    background: linear-gradient(135deg, hsl(var(--color-dimension-groups)), hsl(59 89% 35%));
  }

  &.flow-box-people {
    background: linear-gradient(135deg, hsl(var(--color-dimension-people)), hsl(284 71% 45%));
  }

  &.flow-box-things {
    background: linear-gradient(135deg, hsl(var(--color-dimension-things)), hsl(16 97% 50%));
  }

  &.flow-box-connections {
    background: linear-gradient(135deg, hsl(var(--color-dimension-connections)), hsl(210 100% 45%));
  }

  &.flow-box-events {
    background: linear-gradient(135deg, hsl(var(--color-dimension-events)), hsl(220 90% 50%));
  }

  &.flow-box-knowledge {
    background: linear-gradient(135deg, hsl(var(--color-dimension-knowledge)), hsl(139 69% 25%));
  }
}

.flow-box-icon {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-box-label {
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.flow-box-tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: hsl(var(--color-foreground));
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  z-index: 10;
}

.arrow {
  width: 50px;
  height: 20px;
  color: hsl(var(--color-muted-foreground));
  opacity: 0.5;

  &.arrow-right {
    transform: rotate(0deg);
  }

  &.arrow-left {
    transform: rotate(180deg);
  }

  &.arrow-down {
    width: 20px;
    height: 50px;
    transform: rotate(90deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
```

**Accessibility:**

```typescript
// ARIA labels
<svg className="arrow" aria-label="arrow pointing right">...</svg>

// Decorative diagram, provide text alternative
<div className="sr-only">
  <p>The six dimensions flow from Groups to People to Things, then back from Connections to Events to Knowledge, creating a continuous cycle of data organization and intelligence.</p>
</div>

// Focus management for keyboard users
.flow-box {
  &:focus {
    outline: 2px solid hsl(var(--color-accent));
    outline-offset: 2px;
  }
}
```

---

## Component 2: QuickStartOptions

**Purpose:** Display setup method options with code tabs

**File:** `src/components/QuickStartOptions.tsx`

**Props:**

```typescript
interface QuickStartOptionsProps {
  defaultTab?: 'bootstrap' | 'clone';  // Default: 'bootstrap'
  className?: string;
}
```

**Rendering Structure:**

```typescript
export function QuickStartOptions({
  defaultTab = 'bootstrap',
  className = ''
}: QuickStartOptionsProps) {
  const [selectedTab, setSelectedTab] = useState(defaultTab);

  return (
    <div className={`quick-start-options ${className}`}>
      {/* Tab Navigation */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bootstrap">
            <Zap className="w-4 h-4 mr-2" />
            Bootstrap (Recommended)
          </TabsTrigger>
          <TabsTrigger value="clone">
            <GitClone className="w-4 h-4 mr-2" />
            Manual Clone
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="bootstrap" className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              Fastest way to get started with AI assistance
            </p>
          </div>

          <CodeBlock
            language="bash"
            code={`# Install ONE CLI
npx oneie

# Start Claude Code
claude

# Run ONE command
/one`}
            showLineNumbers={false}
          />

          <div className="space-y-2">
            <h4 className="font-semibold">Why this option?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>AI-assisted development</li>
              <li>Understands 6-dimension ontology</li>
              <li>Generates code, tests, documentation</li>
              <li>20+ scaffolding templates</li>
            </ul>
          </div>

          <Button className="w-full">
            Bootstrap New Project
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </TabsContent>

        <TabsContent value="clone" className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-muted-foreground">
              Clone the repository and develop manually
            </p>
          </div>

          <CodeBlock
            language="bash"
            code={`# Clone repository
git clone https://github.com/one-ie/one.git
cd one/web

# Install dependencies
bun install

# Start development server
bun run dev`}
            showLineNumbers={false}
          />

          <div className="space-y-2">
            <h4 className="font-semibold">Why this option?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Full source code control</li>
              <li>All dependencies included</li>
              <li>Understand the entire codebase</li>
              <li>Contribute back improvements</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Site available at: <code className="bg-muted px-2 py-1 rounded">http://localhost:4321</code>
          </p>
        </TabsContent>
      </Tabs>

      {/* Prerequisites Card */}
      <Alert className="mt-8 border-l-4 border-l-accent">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Prerequisites:</strong> Node.js 18+, Git, Text editor (or Claude Code for AI)
        </AlertDescription>
      </Alert>
    </div>
  );
}

// CodeBlock component
interface CodeBlockProps {
  language: string;
  code: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
}

function CodeBlock({
  language,
  code,
  showLineNumbers = false,
  showCopyButton = true
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>

      {showCopyButton && (
        <button
          onClick={copyCode}
          className="absolute top-2 right-2 bg-accent text-white px-3 py-1 rounded text-xs font-medium opacity-0 hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}
```

**Styling:**

```css
.quick-start-options {
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--color-muted));
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
}

/* Tabs styling */
[role="tablist"] {
  background: hsl(var(--color-secondary));
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

[role="tab"] {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &[aria-selected="true"] {
    background: white;
    color: hsl(var(--color-primary));
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &[aria-selected="false"] {
    color: hsl(var(--color-muted-foreground));

    &:hover {
      color: hsl(var(--color-foreground));
    }
  }
}

[role="tabpanel"] {
  animation: fadeIn 0.3s ease-out;
}

code {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
```

**Accessibility:**

```typescript
// Semantic tab structure
<Tabs>
  <TabsList role="tablist">
    <TabsTrigger role="tab" aria-selected={true} aria-controls="bootstrap-content">
      Bootstrap
    </TabsTrigger>
  </TabsList>
  <TabsContent role="tabpanel" id="bootstrap-content">
    {/* content */}
  </TabsContent>
</Tabs>

// Code accessibility
<pre>
  <code>
    {/* Syntax highlighted code */}
  </code>
</pre>

// Copy button
<button aria-label="Copy code to clipboard">
  <Copy className="w-4 h-4" />
</button>
```

---

## Component 3: QuickWalkthrough

**Purpose:** Display 5-step walkthrough with collapsible details

**File:** `src/components/QuickWalkthrough.tsx`

**Props:**

```typescript
interface QuickWalkthroughProps {
  expandedStep?: number;           // Default: 0 (first expanded)
  className?: string;
}
```

**Rendering Structure:**

```typescript
export function QuickWalkthrough({
  expandedStep = 0,
  className = ''
}: QuickWalkthroughProps) {
  const [expandedIndex, setExpandedIndex] = useState(expandedStep);

  const steps = [
    {
      number: 1,
      title: "Install Dependencies",
      description: "Download packages required for development",
      code: "bun install  # or npm/pnpm install",
      details: "Installs Astro, React, Tailwind, shadcn/ui, and all dependencies"
    },
    {
      number: 2,
      title: "Start Development Server",
      description: "Launch the local development environment",
      code: "bun run dev",
      details: "Runs Astro dev server on http://localhost:4321 with hot module reloading"
    },
    {
      number: 3,
      title: "Create Your First Thing",
      description: "Add a markdown file representing an entity",
      code: `mkdir -p src/content/products
cat > src/content/products/my-first-product.md << 'EOF'
---
title: My Product
price: 29.99
status: active
---

My product description
EOF`,
      details: "Creates a new Thing in the products collection with type-safe properties"
    },
    {
      number: 4,
      title: "Display Things with Components",
      description: "Render your Things using shadcn/ui",
      code: `export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge>${product.price}</Badge>
      </CardContent>
    </Card>
  );
}`,
      details: "Uses ThingCard component pattern for any entity type"
    },
    {
      number: 5,
      title: "Understand the Dimensions",
      description: "Map features to the 6 dimensions",
      code: `// Things: product entity
// People: owner/viewer
// Groups: organization scoping
// Connections: customer-product relationship
// Events: purchase recorded
// Knowledge: product searchable`,
      details: "Ensure every feature maps to one or more dimensions"
    }
  ];

  return (
    <div className={`quick-walkthrough space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <WalkthroughStep
          key={step.number}
          {...step}
          isExpanded={expandedIndex === index}
          onToggle={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
        />
      ))}
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  code: string;
  details: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function WalkthroughStep({
  number,
  title,
  description,
  code,
  details,
  isExpanded,
  onToggle
}: StepProps) {
  return (
    <button
      onClick={onToggle}
      className="step-container w-full"
    >
      <div className="step-header">
        <div className="step-number">{number}</div>
        <div className="step-content">
          <h3 className="step-title">{title}</h3>
          <p className="step-description">{description}</p>
        </div>
        <ChevronDown className={`step-chevron ${isExpanded ? 'expanded' : ''}`} />
      </div>

      {isExpanded && (
        <div className="step-details">
          <div className="step-details-content">
            <p className="text-sm text-muted-foreground mb-4">{details}</p>

            <CodeBlock
              language={number === 3 ? "bash" : number === 4 ? "typescript" : "text"}
              code={code}
              showLineNumbers={number > 1 && number < 4}
              showCopyButton={true}
            />
          </div>
        </div>
      )}
    </button>
  );
}
```

**Styling:**

```css
.step-container {
  border: 1px solid hsl(var(--color-muted));
  border-radius: 0.75rem;
  overflow: hidden;
  text-align: left;
  transition: all 0.3s ease;

  &:hover {
    border-color: hsl(var(--color-accent));
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  &[aria-expanded="true"] {
    border-color: hsl(var(--color-accent));
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  cursor: pointer;
}

.step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, hsl(var(--color-primary)), hsl(222.2 47.4% 15%));
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--color-foreground));
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.875rem;
  color: hsl(var(--color-muted-foreground));
}

.step-chevron {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: hsl(var(--color-muted-foreground));
  transition: transform 0.3s ease;

  &.expanded {
    transform: rotate(180deg);
  }
}

.step-details {
  border-top: 1px solid hsl(var(--color-muted));
  background: hsl(var(--color-secondary));
  animation: slideDown 0.3s ease-out;
}

.step-details-content {
  padding: 1.5rem;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .step-header {
    gap: 0.75rem;
    padding: 1rem;
  }

  .step-number {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .step-title {
    font-size: 1rem;
  }
}
```

**Accessibility:**

```typescript
// Semantic button structure
<button
  onClick={onToggle}
  aria-expanded={isExpanded}
  aria-controls={`step-${number}-details`}
  className="step-header"
>
  {/* header content */}
</button>

<div id={`step-${number}-details`} role="region">
  {/* details content */}
</div>

// Keyboard navigation
.step-container {
  &:focus-visible {
    outline: 2px solid hsl(var(--color-accent));
    outline-offset: 2px;
  }
}

// Chevron indication
<ChevronDown
  className="step-chevron"
  aria-hidden="true"
/>
```

---

## Responsive Design Adjustments

### Mobile (320px - 640px)

```css
/* OntologyFlow */
.flow-container {
  gap: 0.5rem;
  padding: 1rem;
}

.flow-row {
  flex-direction: column;
  gap: 0.25rem;
}

.flow-box {
  width: 100px;
  height: 80px;
  font-size: 0.75rem;
}

.arrow {
  display: none; /* Hide arrows on mobile for clarity */
}

/* QuickStartOptions */
.quick-start-options {
  padding: 1rem;
}

[role="tab"] {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}

/* QuickWalkthrough */
.step-header {
  padding: 1rem;
  gap: 0.75rem;
}

.step-number {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}
```

### Tablet (641px - 1024px)

```css
/* OntologyFlow */
.flow-container {
  gap: 1.5rem;
}

.flow-row {
  grid-template-columns: repeat(2, 1fr);
}

.flow-box {
  width: 110px;
  height: 90px;
}

/* QuickStartOptions */
.quick-start-options {
  padding: 1.5rem;
}
```

---

## Integration Notes

1. **Import Components in Page:**

```astro
---
// src/pages/docs/getting-started/quick-start.astro
import { OntologyFlow } from '@/components/OntologyFlow';
import { QuickStartOptions } from '@/components/QuickStartOptions';
import { QuickWalkthrough } from '@/components/QuickWalkthrough';
---

<Layout>
  <OntologyFlow client:visible />
  <QuickStartOptions client:load />
  <QuickWalkthrough client:idle />
</Layout>
```

2. **Hydration Directives:**
   - `OntologyFlow`: `client:visible` (loads when visible)
   - `QuickStartOptions`: `client:load` (critical interaction)
   - `QuickWalkthrough`: `client:idle` (can defer loading)

3. **Dependencies:**
   - lucide-react (icons)
   - shadcn/ui (Card, Button, Tabs, Alert)
   - Tailwind v4
   - TypeScript

