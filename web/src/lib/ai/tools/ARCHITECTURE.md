# AI Code Generation Tools - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                   (CYCLE 9 - Not yet implemented)                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT (CYCLE 7)                          │
│                 /api/chat-website-builder                            │
│                                                                       │
│  • Receives user messages                                            │
│  • Calls Claude Code AI with tools                                   │
│  • Streams responses (SSE)                                           │
│  • Returns generated code                                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
┌──────────────────────────────────┐  ┌──────────────────────────────┐
│      CLAUDE CODE AI SDK          │  │    SYSTEM PROMPT             │
│                                  │  │                              │
│  • Claude Sonnet 4.5             │  │  • 6-dimension ontology      │
│  • Built-in tools (Read, Write)  │  │  • Component library         │
│  • Extended thinking             │  │  • Template-first workflow   │
└──────────────────────────────────┘  │  • Golden rules              │
                    │                  └──────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AI CODE GENERATION TOOLS                          │
│                          (CYCLE 7)                                   │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  generateAstro  │  │   modifyCode    │  │ searchComponents│
│     Page        │  │                 │  │                 │
│                 │  │                 │  │                 │
│ • 8 page types  │  │ • Update code   │  │ • 50+ shadcn/ui │
│ • Templates     │  │ • Preserve      │  │ • Custom comps  │
│ • Features      │  │   structure     │  │ • Ontology      │
│ • Multi-tenant  │  │ • Suggestions   │  │ • Examples      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPONENT LIBRARY                                │
│                                                                       │
│  • shadcn/ui (50+ components)                                        │
│  • Custom Features (ProductGallery, ChatClient)                      │
│  • Ontology (ThingCard, PersonCard, EventItem)                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        TEMPLATES                                     │
│                                                                       │
│  • /web/src/pages/shop/product-landing.astro                        │
│  • (More templates can be added)                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Tool Flow Diagrams

### generateAstroPage Flow

```
User Input
"Create a product page for coffee mugs"
         │
         ▼
┌─────────────────────┐
│ AI analyzes request │
└─────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Calls generateAstroPage │
└─────────────────────────┘
         │
         ▼
Parameters:
• description: "Create a product page..."
• route: "/products/coffee-mug"
• pageType: "product"
• features: ["product-gallery", "reviews"]
• groupScoped: true
         │
         ▼
┌──────────────────────┐
│ Generate frontmatter │  → Imports, getStaticPaths, data fetching
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Generate markup      │  → HTML with components
└──────────────────────┘
         │
         ▼
Output:
• code: "---\nimport Layout..."
• filePath: "web/src/pages/products/coffee-mug.astro"
• components: ["Card", "Button", "Badge"]
• instructions: "1. Review code\n2. Replace placeholders..."
         │
         ▼
┌──────────────────────┐
│ AI uses Write tool   │  → Creates file
└──────────────────────┘
```

### modifyCode Flow

```
User Input
"Add a reviews section"
         │
         ▼
┌─────────────────────┐
│ AI analyzes request │
└─────────────────────┘
         │
         ▼
┌──────────────────┐
│ Calls modifyCode │
└──────────────────┘
         │
         ▼
Parameters:
• currentCode: "---\nimport Layout..."
• modificationRequest: "Add a reviews section"
• fileType: "astro"
• preserveComments: true
         │
         ▼
┌────────────────────┐
│ Analyze request    │  → Action: "add", Target: "reviews"
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Split code         │  → Frontmatter | Markup
└────────────────────┘
         │
         ▼
┌────────────────────┐
│ Apply modification │  → Insert reviews section
└────────────────────┘
         │
         ▼
Output:
• modifiedCode: "---\nimport Layout...[REVIEWS]..."
• changes: ["Added reviews section"]
• suggestions: ["Add star rating", "Implement pagination"]
         │
         ▼
┌──────────────────────┐
│ AI uses Edit tool    │  → Updates file
└──────────────────────┘
```

### searchComponents Flow

```
User Input
"I need a button with variants"
         │
         ▼
┌─────────────────────┐
│ AI analyzes request │
└─────────────────────┘
         │
         ▼
┌───────────────────────┐
│ Calls searchComponents│
└───────────────────────┘
         │
         ▼
Parameters:
• description: "button with variants"
• category: "ui"
• includeExamples: true
         │
         ▼
┌──────────────────────┐
│ Search library       │
└──────────────────────┘
         │
         ├─→ shadcn/ui components
         ├─→ Custom components
         └─→ Ontology components
         │
         ▼
┌──────────────────────┐
│ Match by keywords    │  → "button" matches Button component
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Generate examples    │  → Usage code for each result
└──────────────────────┘
         │
         ▼
Output:
• components: [
    {
      name: "Button",
      category: "ui",
      path: "@/components/ui/button",
      variants: ["default", "outline", "ghost"],
      example: "import { Button } from '@/components/ui/button'..."
    }
  ]
• count: 1
• suggestions: ["Consider Button variants", "Add loading state"]
         │
         ▼
┌──────────────────────┐
│ AI explains results  │  → "Found Button component with 6 variants..."
└──────────────────────┘
```

## Data Flow

### Request → Response

```
1. User sends message
   POST /api/chat-website-builder
   {
     "messages": [{ "role": "user", "content": "Create product page" }],
     "model": "sonnet"
   }
         │
         ▼
2. API adds system prompt
   [
     { role: "system", content: "You are an expert website builder..." },
     { role: "user", content: "Create product page" }
   ]
         │
         ▼
3. Claude Code processes with tools
   streamText({
     model: claudeCode("sonnet"),
     messages,
     tools: { generateAstroPage, modifyCode, searchComponents }
   })
         │
         ▼
4. AI decides to use tools
   Tool Call: generateAstroPage({ description: "...", pageType: "product" })
         │
         ▼
5. Tool executes and returns result
   { code: "---\nimport...", filePath: "...", components: [...] }
         │
         ▼
6. AI formats response
   "I've generated a product page for you. Here's the code:..."
         │
         ▼
7. Response streams to client (SSE)
   data: {"choices":[{"delta":{"content":"I've generated"}}]}
   data: {"type":"tool_call","payload":{"name":"generateAstroPage"}}
   data: {"type":"tool_result","payload":{"result":{...}}}
   data: [DONE]
```

## File Operations

### Tool Output → File System

```
Tool generates code
         │
         ▼
Returns to AI
{
  code: "---\nimport Layout...",
  filePath: "web/src/pages/products/coffee-mug.astro"
}
         │
         ▼
AI recognizes file path
"I'll create the file at web/src/pages/products/coffee-mug.astro"
         │
         ▼
AI calls built-in Write tool
Write({
  file_path: "/home/user/one.ie/web/src/pages/products/coffee-mug.astro",
  content: "---\nimport Layout..."
})
         │
         ▼
File created
/home/user/one.ie/web/src/pages/products/coffee-mug.astro
```

## Component Discovery

### How searchComponents finds components

```
Component Library
├── shadcn/ui (50+)
│   ├── Button
│   ├── Card
│   ├── Input
│   └── ...
├── Custom Features
│   ├── ProductGallery
│   └── ChatClient
└── Ontology
    ├── ThingCard
    ├── PersonCard
    └── EventItem

Search Query: "button with variants"
         │
         ▼
Keyword matching
• "button" → Matches Button.name
• "variants" → Matches Button.variants
         │
         ▼
Exact match prioritization
• Button.name.toLowerCase() === "button" → Priority 1
• Card.name.toLowerCase().includes("button") → Priority 2
         │
         ▼
Results sorted by priority
[
  { name: "Button", priority: 1 },
  { name: "ButtonGroup", priority: 2 }
]
```

## Integration Points

### Future CYCLE 8: Testing

```
┌──────────────────────┐
│   Test Suite         │
│                      │
│ • Unit tests         │
│ • Integration tests  │
│ • E2E tests          │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Test each tool       │
└──────────────────────┘
```

### Future CYCLE 9: UI

```
┌──────────────────────┐
│  Visual Interface    │
│                      │
│ • Chat UI            │
│ • Code preview       │
│ • Live editing       │
│ • Copy/paste         │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ API (existing)       │
└──────────────────────┘
```

### Future CYCLE 10: Advanced

```
┌──────────────────────┐
│ Advanced Features    │
│                      │
│ • Multi-page gen     │
│ • Component extract  │
│ • Style customize    │
│ • AI refactoring     │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│ Tools (existing)     │
└──────────────────────┘
```

---

**Built for CYCLE 7 - AI Code Generation Tools**
